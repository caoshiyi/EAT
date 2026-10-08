# AMD KDA Prefill — Kimi Delta Attention Chunked Prefill on MI350X

## Task
Optimize the Kimi Delta Attention (KDA) prefill kernel on **AMD Instinct MI350X (gfx950, CDNA4)** to
**beat the current state of the art**: vLLM's hand-written ROCm KDA prefill kernels (the Kimi-K3
production path, vLLM commit 9521c60). `vs_base` is measured against that SOTA kernel, so the goal is
`mean_vs_base > 1.0` across all 10 workloads. The SOTA source is provided in `sota/` and you are
encouraged to read, reuse, and modify it — the question is whether you can improve on it.

**Starting point: the SOTA kernel itself.** The initial `kernel.cu`/`kernel.h`/`main.cpp` are a faithful
port of the vLLM kernels into this task's interface (scores ≈0.99; the gap is its device-side metadata
launch, which the optional `prepare` hook below removes). You do not need to reach parity — you start
there. Every experiment should be about going *beyond* the SOTA design.

For reference, the SOTA kernel is ~2.7× faster than the flash-linear-attention (fla) Triton `chunk_kda`
on average, and ~1.24× faster than AITER's gfx950 Gluon `flash_kda` (measured on this machine: AITER
is 0.81× SOTA on these workloads, winning only on skewed mixed batches). The eval also prints `vs_fla`.

## What a previous attempt learned (do not repeat it)
A previous run ported SOTA (0.989) and then only tuned host-side policy: chunk-group counts, where the
metadata is computed, a "split every sequence into 8 groups if the batch looks unbalanced" rule. It
reached 1.037, but all of it came from `p_mixed`; the other nine workloads stayed within ±3% (noise),
and the unbalanced-batch rule made unseen batches of many short sequences 1.7–2.9× *slower* than SOTA.
Profiling showed where the time actually goes:
- `kda_chunk_prologue` is **60–75% of runtime** and is latency/barrier bound (one 64-token chunk of
  one head per workgroup, long serial dependency chain: norms → gate cumsum → Akk → triangular inverse
  → w/u, many `__syncthreads`).
- `kda_chunk_fused` has only `N·H·(V/BV)` workgroups (96 for one sequence) — most of 256 CUs idle.
- The two kernels run back to back, so the recurrence never overlaps the prologue.
The wins are therefore in the kernel design (prologue restructuring, prologue/recurrence overlap,
better work distribution), not in dispatch thresholds.

## What is KDA?
KDA is the linear attention used in 69 of the 93 layers of Kimi-K3. It is a gated delta rule with a
**per-channel** (per key dimension) forget gate instead of GDN's per-head scalar gate:
- **Forget gate** (g, log space, per key channel): `g = lower_bound * sigmoid(exp(A_log[h]) * (raw_g + dt_bias[h, k]))`,
  `lower_bound = -5`, so every per-step decay `exp(g)` lies in `[exp(-5), 1)`.
- **Update gate**: `beta = sigmoid(raw_beta)` (one scalar per token and head).
- q and k are L2-normalized over head_dim (eps 1e-6) inside the kernel.
- **Running state** fp32 `[H, V, K]` per sequence (V-major), carried across tokens.

## Algorithm (token recurrence; the chunked form is yours to derive)
```
S: [K, V] (math view; stored V-major as [V, K])
for each token t of a sequence:
    S      = diag(exp(g_t)) @ S                    # per-key-channel decay
    u      = beta_t * (v_t - k_t^T S)              # delta-rule correction, [V]
    S      = S + k_t u^T
    o_t    = scale * q_t^T S                       # [V], scale = 128**-0.5
```
`reference.py` is the exact fp32 definition. Everything (norms, gate, beta, recurrence) must happen inside
your kernel(s) — the inputs are raw projections.

## API
```cpp
void kda_prefill_kernel_launch(
    bf16_bits* output,              // [total_seq_len, H, 128]
    float* new_state,               // [num_seqs, H, 128(V), 128(K)]
    const bf16_bits* q, *k, *v,     // [total_seq_len, H, 128]
    const bf16_bits* raw_g,         // [total_seq_len, H, 128]
    const bf16_bits* raw_beta,      // [total_seq_len, H]
    const float* A_log,             // [H]
    const float* dt_bias,           // [H * 128]
    const float* state,             // [num_seqs, H, 128(V), 128(K)] or nullptr
    const int64_t* cu_seqlens,      // [num_seqs + 1]
    int32_t num_seqs, int32_t num_heads, float scale, float lower_bound,
    int64_t total_seq_len, hipStream_t stream);
```
`bf16_bits` is `uint16_t` holding raw bf16 bits (main.cpp is compiled by the host compiler and cannot include
`hip_bf16.h`); reinterpret to `__hip_bfloat16` inside `kernel.cu`. `main.cpp::run` returns
`{output, new_state}`. You may change `kernel.cu`, `kernel.h` and `main.cpp` freely (e.g. multiple kernel
launches, workspaces allocated in `main.cpp`), as long as `run()` keeps its Python signature.

## Key Dimensions
- num_heads H = 12 (96 KDA heads / TP8), head_dim K = V = 128
- Variable-length batches via `cu_seqlens`; every workload passes an initial state
- Workloads (`tools/eval_amd_kda_mi350x.py`): single sequences of 1k/4k/16k/64k tokens, 4×4k, 8×2k,
  16×1k, 32×512, 64×128, and one mixed batch (8192, 1024, 777, 512, 256, 130, 64, 17)
- Note: only 12 heads per sequence, so a single long sequence exposes very little (sequence, head)
  parallelism on 256 CUs.

## Target Architecture: AMD Instinct MI350X (gfx950, CDNA4)
- 256 compute units, **wave64** (64 lanes per wavefront)
- Matrix cores via **MFMA** instructions (e.g. `__builtin_amdgcn_mfma_f32_16x16x32_bf16`, new in CDNA4);
  see the CDNA4 ISA guide and `/opt/rocm/include` (rocWMMA headers) for the available shapes
- 160 KB LDS per CU, 512 VGPRs + AGPRs per lane budget shared by occupancy
- 288 GB HBM3E, ~8 TB/s; 256 MB Infinity Cache (the eval flushes it before every timed run)
- Compile flag: `--offload-arch=gfx950` (already set by the eval)
- Profiling: `rocprofv3` (kernel trace, counters), `omniperf`/`rocprof-compute` if available

## Environment
Everything runs on the GPU node. Use:
```bash
cd $EAT_ROOT
source $EAT_VENV/bin/activate
export TRITON_CACHE_DIR=$EAT_CACHE/triton
export HIP_VISIBLE_DEVICES=<your assigned GPU>   # HIP numbering, one of $EAT_GPUS
```
Never run on a GPU you were not assigned. Keep builds and caches under `$EAT_WORK`.

## Eval
```bash
python tools/eval_amd_kda_mi350x.py --quick     # 4 workloads, fast feedback
python tools/eval_amd_kda_mi350x.py             # all 10 workloads
```
The eval builds `kernel.cu` + `main.cpp` with `torch.utils.cpp_extension`, checks output and final state
against `reference.py` (relative L2 error ≤ 2e-2 each), and times each workload (median of 50 runs, cache
flushed). Baseline latencies are recorded once in `baseline_sota.json` (scored) and `baseline_fla.json`
(reference) — never re-record them.

Two candidate forms are accepted:
- **HIP C++** (default): `kernel.cu` + `kernel.h` + `main.cpp`, built as a torch extension.
- **Python / Gluon / Triton**: if `tasks/amd_kda_mi350x/kernel.py` exists, the eval imports it *instead*
  of building `kernel.cu`. It must define `run(q, k, v, raw_g, raw_beta, A_log, dt_bias, state,
  cu_seqlens, scale, lower_bound[, meta]) -> {"output": ..., "new_state": ...}`. It may also compile
  and call its own HIP code (e.g. `torch.utils.cpp_extension.load`), so a hybrid (Gluon prologue +
  HIP recurrence, or vice versa) is fine. Delete/rename `kernel.py` to go back to the HIP path.

Optional untimed metadata hook (either form): if the module defines `prepare(cu_seqlens) -> meta`, the
eval calls it once per workload outside the timed region and passes `meta=` to `run`. This is the same
allowance the SOTA baseline gets (vLLM builds `chunk_indices`/`chunk_offsets` once per batch and shares
them across all 69 KDA layers). `prepare` may only derive schedule/index metadata from `cu_seqlens`
(chunk maps, group/segment descriptors, work lists); it must not read q/k/v/g/beta/state or preallocate
outputs — all compute and workspace allocation stays in the timed `run`. For the pybind path, expose
`prepare` from `main.cpp` and add a `meta` argument to `run`.

Host launch overhead is timed (no graph capture), so for Python candidates keep the launch path lean:
precompile, avoid per-call Python work, and see AITER's
`aiter/ops/triton/_triton_kernels/chunk_delta_attn/fast_launch.py` for a low-overhead Triton launcher.

## The SOTA baseline (`sota/`)
- `fused_kda_chunk_kernel_rocm.cu` — the vLLM kernels, unmodified: `kda_chunk_prologue` (one chunk of one
  head per workgroup: L2 norms, gate cumsum, intra-chunk attention, triangular inverse with MFMA, w/u) and
  `kda_chunk_fused` (walks the 64-token chunks of one (sequence, head) for a slice of V with the [V, K]
  state in MFMA accumulators; long sequences are split into parallel chunk groups recombined by
  `kda_group_scan`). Read the header comment for the math.
- `sota_kda.py` — the Python launcher (workspace allocation, chunk-group policy `_chunk_groups`);
  `vllm_reference/` has the original vLLM wrappers. `build.sh` builds `libkda_sota.so`.
- Timing note: the baseline's host-side metadata (`chunk_indices`, `chunk_offsets`) is built once per batch
  outside the timed region, as vLLM does; its workspace allocations and both launches are timed. Your
  candidate gets the same treatment through the optional `prepare` hook (see Eval).
- The starting `kernel.cu` is a port of exactly these kernels (plus a small device-side metadata
  kernel `kda_meta` that you can move into `prepare`). An earlier independent design (1.41× fla,
  0.56× SOTA) is saved as `solutions/kernel_v7_1.412.cu` if you want to mine it.

## Reference kernels from other SOTA libraries (all readable)
Shallow clones under `$EAT_REFS/` (commits in `refs.txt`; `bash fetch_refs.sh` recreates them):

| repo | most relevant paths |
|------|---------------------|
| `aiter` (AMD) | `aiter/ops/triton/_gluon_kernels/gfx950/chunk_delta_attn/flash_kda_k{1,2}.py` (**gfx950 Gluon KDA prefill** — the best worked example of Gluon on this GPU: explicit `AMDMFMALayout` v4, state kept as the MFMA accumulator and reused as a B operand with no round trip), `aiter/ops/triton/_triton_kernels/chunk_delta_attn/flash_kda.py` (launcher: C=32 chunks, segment/affine scan `h' = A_seg h + b_seg` with A_seg produced by the same kernel seeded with `h = I`, `_choose_chunks_per_seg`), `.../fast_launch.py`, `aiter/ops/triton/_gluon_kernels/gfx950/{attention,gemm}` (more Gluon gfx950 idioms), `csrc/kernels/chunk_gated_delta_rule_fwd_h.cu` (HIP), `aiter/ops/flydsl/kernels/gdr_prefill/` |
| `flash-linear-attention` (fla) | `fla/ops/kda/` (chunk_fwd, chunk_intra, wy_fast, gate), `fla/ops/gated_delta_rule/` |
| `flashinfer` (main, 5ce4ef8) | **Blackwell FlashKDA prefill**, the most relevant NVIDIA design: dispatcher and route policy in `flashinfer/kda_prefill.py` + `flashinfer/kda.py` (routes: `persistent_m128`, `lpt_persistent_m128` (longest-processing-time persistent scheduling for varlen), `small_bh_owner_helper_m128` (few (batch, head) pairs × long sequence: *helper* CTAs run the prepare step and stream packets through a ring buffer to the *owner* CTA that carries the state — i.e. prologue/recurrence overlap, exactly our H=12 problem), `affine_split_m128` (context-parallel map → scan → correction)); kernels in `csrc/kda/`: `cake_flashkda_bf16_fused_m128_h12_{long,short}.cu` (H=12 specialisations), `cake_flashkda_bf16_persistent_m128.cu`, `cake_flashkda_bf16_piece_persistent_m128.cu`, `cake_flashkda_bf16_small_bh_m128.cu`, `cake_flashkda_bf16_bt16_{prepare,chain_m64}.cu` (16-token chunks, prepare/chain split), `cake_kda_affine_unbounded_softplus_{map,scan,correction}.cu`, `flashkda_bf16_fused_m128_n16_checkpoint.cu`; CuTe-DSL versions in `flashinfer/kda_prefill_cute.py`, `flashinfer/kda_prefill_cute_small_bh.py`, `flashinfer/kda_kernels/kda_chunked_bt16*.py`; GDN analogues in `csrc/gdn/`, `flashinfer/gdn_prefill.py`, `flashinfer/gdn_kernels`; benchmarks `benchmarks/bench_recurrent_kda_prefill.py`, `benchmarks/presets/recurrent_kda_prefill_h12.json` |
| `flash-attention` | FlashAttention-4 (CuTe DSL, SM100) in `flash_attn/cute/`: `flash_fwd_sm100.py` (warp specialization: load / MMA / softmax / correction roles, ping-pong of two tiles so one tile's MMA overlaps the other's non-MMA math, TMEM accumulators), `pipeline.py` + `named_barrier.py` (producer/consumer pipelines with fine-grained barriers instead of block-wide syncs), `tile_scheduler.py` + `prepare_scheduler.py` (persistent + LPT scheduling for varlen), `fast_math.py` (polynomial exp2 emulation to offload the SFU) |
| `gpu-mode-reference-kernels` | `problems/linalg/qr_py`, `problems/linalg/qr_v2` (GPU MODE QR contests), `problems/helion/gated_deltanet_{recompute_w_u,chunk_fwd_h,chunk_fwd_o}_py` |
| `gau-nernst-gpu-mode-kernels` | `linalg/qr_v2` (2nd-place QR submission: panel Householder, compact WY) |
| `qrv2-gpu-mode` | `submission.py`, `ALGORITHM.md` (compact-WY QR megakernels, recursive panel factorization) |

The NVIDIA kernels target SM90/SM100 and do not compile for gfx950 as is; mine them for algorithms,
decompositions and scheduling ideas (UT/WY transforms, blocked triangular solves, chunk-state scans,
producer/consumer pipelining) and port what helps to HIP/MFMA. Blackwell-to-CDNA4 translation hints:
TMA/cp.async → `global_load_lds` / buffer loads direct to LDS (gfx950 supports up to 128-bit direct
loads) or register prefetch; warp specialization → wave specialization inside a workgroup with
`__builtin_amdgcn_s_setprio`, `s_barrier` on subsets via LDS flags, or separate producer/consumer
workgroups communicating through global memory flags (the owner/helper pattern); TMEM accumulators →
AGPR-resident MFMA accumulators; CTA clusters → no direct equivalent, use L2/Infinity-Cache-resident
workspaces; `tcgen05` 128-wide MMA → 16×16×32 / 32×32×16 bf16 MFMA tiles.

Concrete directions worth trying (not exhaustive): fuse the prologue into the recurrence kernel as a
persistent producer/consumer design so chunk i+1's prologue overlaps chunk i's recurrence; restructure
the prologue to shorten its serial chain (smaller sub-blocks, fewer barriers, more waves per chunk,
C=16/32 variants as in FlashKDA BT16 and AITER C=32); a persistent LPT work list so varlen batches
balance by construction rather than by threshold; context-parallel affine scan for few long sequences.

## Goal beyond SOTA: the Blackwell KDA frontier (B200/B300)

Beating vLLM's ROCm kernel is not the end goal any more (the current best is ~2.03x). The goal is to match the
best KDA prefill kernels on NVIDIA Blackwell, a GPU class with about the same bf16 MFMA/tensor-core peak
(~2.3 PF dense) and HBM bandwidth (8 TB/s) as MI350X. Matching Blackwell means matching its time per unit of work.

**Newest published Blackwell numbers** (all D=128, bf16 inputs, fp32 state updated in place, 8192 total tokens,
cold-L2 CUPTI kernel time; baseline MoonshotAI FlashKDA):

| Source | GPU | fixed [8192] | mixed [1300,547,2048,963,271,3063] | uniform [1024]x8 | vs FlashKDA |
|---|---|---|---|---|---|
| FlashInfer #5665, Cake-generated PTX (merged 2026-09-30), H=96 | B300 | 0.360 ms | 0.273 ms | 0.268 ms | 2.92x geomean |
| same, H=64 | B300 | 0.322 ms | 0.188 ms | 0.182 ms | |
| FlashInfer #5612, persistent CuTe DSL | B300 | | | | 2.80x |
| FlashInfer #4262, Cake prefill (bf16 state), H=96 | B200 | 0.506 ms | 0.391 ms | 0.435 ms | 2.05x |

Code for all of these is in `$EAT_REFS/flashinfer` (checked out at `origin/main` 5ce4ef8): #5612 in
`flashinfer/kda_prefill_persistent.py` and `benchmarks/bench_recurrent_kda_persistent.py`; #5665 in `csrc/kda/ptx/`
(PTX + JSON schedules per workload), `flashinfer/kda_kernels/ptx/scheduler.py`, `flashinfer/kda_prefill_ptx.py` and
`benchmarks/bench_recurrent_kda_ptx.py`).
Read how they schedule chains, split long sequences and hand state between CTAs; #5612 uses a split grid that
assumes full residency (the same deadlock caveat as our relay).

**Normalized to time per head-token** (time / (total tokens x heads); for our kernel subtract the ~6 us host-timing
floor of the eval, which CUPTI excludes):

| Regime | B300 #5665 | ours (iteration 6, 2.03x) | gap |
|---|---|---|---|
| batched, throughput-bound (1024x8, mixed) | 0.34-0.36 ns | 0.72-0.75 ns (16x1k, 8x2k, 32x512) | ~2.1x |
| one long sequence | 0.46 ns (H=96), 0.61 ns (H=64) | 1.0-1.1 ns (1x16k, 1x64k) | 1.6-2.3x on paper |

Blackwell has 64-96 heads there, i.e. far more independent chains than our H=12, so single-sequence and small
shapes are harder for us than the table suggests; there are no published H=12 numbers for these kernels.

**Targets in this eval's terms** (per-shape vs_base if we matched Blackwell; batched shapes from 0.35 ns/head-token
+ 6 us floor, singles scaled 1.2-1.6x from today):

| shape | today (us) | Blackwell-parity target (us) | target vs_base |
|---|---|---|---|
| p_4x4k / p_8x2k / p_16x1k / p_32x512 | 148-205 | ~75 | 4.2-5.1 |
| p_64x128 | 93 | ~40 | 4.7 |
| p_mixed | 151 | ~75 | ~6.5 |
| p_1x1k / p_1x4k / p_1x16k / p_1x64k | 41 / 74 / 224 / 786 | 34 / 53 / 149 / 491 | 1.8 / 2.3 / 2.7 / 2.8 |
| **eval mean** | 2.03 | | **~3.5-4** |

For scale, the memory roofline is ~0.16-0.2 ns/head-token (inputs + outputs at 8 TB/s): Blackwell is ~2x above it,
we are ~4x above it. Report progress against this target (time per head-token per regime), not only vs_base.
Correctness rules do not change: RTOL 2e-2 on the eval and the slow-decay check for every kept change; no shape
special-casing and no exploiting the eval's fast-decay gates.

## Scoring
`mean_vs_base` = mean(sota_latency / your_latency) over all workloads; correctness is a hard constraint.

**The score is `mean_vs_base` on the 10 eval workloads, nothing else.** The final solution is also run on
held-out batch shapes that are not in the eval (other sequence counts, lengths and length distributions,
still H=12, K=V=128), but only to check that it is correct there and is not special-cased to the eval shapes:
held-out speed is not scored, so a gain that shows up only on non-eval shapes is not progress. Dispatch logic
must follow from the kernel's cost model (work per CU, chunks per sequence, occupancy), not from matching the
10 eval shapes; a rule that wins `p_mixed` but badly loses on other uneven batches is shape-matching. Sanity-check
any policy change on a few shapes of your own before keeping it.

## Rules (task-specific)
- The final kernel may be **HIP C++** (`kernel.cu`) or **Gluon/Triton** (`kernel.py`, see Eval), or a
  hybrid of the two. Use Gluon (`triton.experimental.gluon`, Triton 3.8 in the venv, `gl.amd.cdna4.mfma`,
  explicit layouts) if hand-written HIP/MFMA is the bottleneck to trying an idea; use whichever gives
  the faster kernel.
- **All sources are allowed**: the SOTA kernel in `sota/`, the fla package, vLLM, AITER, Composable
  Kernel, flashinfer, FlashAttention (incl. FA4), GPU MODE contest submissions, papers, and profiling of
  any kernel including the baselines.
- Do not modify `sota/`, `baseline_*.json`, `reference.py`, or `tools/eval_amd_kda_mi350x.py`.

## References
- [Kimi Linear: An Expressive, Efficient Attention Architecture](https://arxiv.org/abs/2510.26692)
- [Parallelizing Linear Transformers with the Delta Rule over Sequence Length](https://arxiv.org/abs/2406.06484)
- AMD Instinct CDNA4 Instruction Set Architecture reference guide (AMD documentation hub)

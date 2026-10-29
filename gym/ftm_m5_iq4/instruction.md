# FreeToken-metal on an M5 Pro: Qwen3.8-Flash-Next from its GGUF (UD-IQ4_XS), expert offload, full context

## Task
Make FreeToken-metal (`ftmetal`, an MLX + Metal LLM serving engine) serve **Qwen3.8-Flash-Next from the unsloth
UD-IQ4_XS GGUF** as fast as possible on **this Apple M5 Pro (20-core GPU, 48 GB unified memory, macOS 26.7)**, where
the model (87 GiB) does not fit in memory and its routed experts stream from the SSD, with the model's whole
262144-token context available, as `ftm serve --model $FTM_GGUF_IQ4` runs it with no other flags.

- **Starting point.** the repository, branch `main`: a native GGUF path for this model (ggml block formats on Metal:
  IQ4_XS / IQ4_NL / Q6_K / Q8_0 rows, matvec and tiled matmul; the dense weights read as ggml too; routed experts as
  contiguous per-expert records under `$FTMETAL_MOE_DERIVED_ROOT/Qwen3.8-Flash-Next-UD-IQ4_XS/expert_records`;
  MTP speculative decoding with a head rebuilt from the original bf16 `mtp.*` tensors, under
  `$FTMETAL_MOE_DERIVED_ROOT/Qwen3.8-Flash-Next-MTP-4bit/head_requant`; QSA sparse prefill; a host victim cache
  and page-cache tier). It was tuned on an M4 Pro. Fixed for this M5 in `main`: the flash-prefill matmul2d path
  (wrong results on this GPU generation before), the victim cache and the host tier no longer `mlock`ed by default
  (pinning put wired memory past the watchdog), and SIGTERM unwinding.
- **Measured on this machine at the start** (the eval's speed suite, greedy, MTP on; tok/s):

  | | starting code (IQ4_XS) |
  |---|---|
  | decode, short prompt | 34.3 |
  | prefill ~4K / ~32K | 451 / 456 |
  | prefill ~128K / ~250K | 442 / 425 |
  | decode after ~128K / ~250K | 31.1 / 31.4 |

  Other engines on the same suite and machine: `tasks/ftm_m5_iq4/REFERENCE.md`.
  The repository's branch `m5/gguf` (shared history) holds a second GGUF implementation for the UD-Q4_K_XL file;
  its numbers on this machine are in `REFERENCE.md` too.
- **Hardware fact.** This GPU (Apple M5, `applegpu_g17s`) has matrix units in every GPU core (Apple's "neural
  accelerators"; MLX calls its kernels for them NAX; Metal 4 exposes them through MetalPerformancePrimitives
  `matmul2d` / tensor ops); the M4 has none. In the starting code, the ggml matmul / matvec kernels use
  `simdgroup_matrix` instructions and the flash-prefill attention uses `matmul2d`.
- **Test suite:** `tests/` passes on the starting code except six `tests/kernel/test_qmm_tiled.py` cases listed in
  `tasks/ftm_m5_iq4/known_failures.txt`: they compare a tiled kernel bit-exactly with MLX's `quantized_matmul`,
  and on this GPU the two differ by one bf16 rounding step at some outputs (both are equally far from an fp32
  reference). Keep everything else green; new kernels get tests. Run it with `MLX_ENABLE_TF32=0` (as the eval does).

## Available work (branch `m5/gguf`, same repository)
Changes on that branch (for the UD-Q4_K_XL file), with their commits:
- Elastic KV: while requests are short, the full-context KV reservation is lent to expert slots, and the engine is
  rebuilt with the whole reserve when a request needs it (`61b6d9d`, `d86881d`), with the offload cache releasing
  its buffers on that rebuild (`82ccbdd`: a server's old cache otherwise stays referenced and the rebuild runs out
  of GPU memory).
- Router look-ahead prefetch of the next layer's experts (`2147288`, `95e68a4`, `f078298`).
- Flash-prefill tuning for this GPU: matmul2d on 16-row register fragments, 64-row NAX tiles (`c4f41fb`, `6140878`,
  `a6d66e8`); sorted expert gathers kept inside their banks at a K tail (`6171560`, `b723342`, `9629818`). These
  do not apply cleanly to this branch.

## Other engines
Numbers of other engines on the same suite and machine: `tasks/ftm_m5_iq4/REFERENCE.md`.

## Workload and score (the official eval)
`python tools/eval_ftm_m5_iq4.py` runs `tasks/ftm_m5_iq4/harness/gguf/run.py` on the repository:
- phase 1, correctness, in-process and teacher-forced: three recorded coding-agent sessions, a decode benchmark and
  a long-output session, compared at every response position with llama.cpp's distributions on the same GGUF;
- phase 2, serving: `ftm serve --model $FTM_GGUF_IQ4`, then the speed suite (decode after a short prompt; prefill at
  ~4K and ~32K; ~128K and ~250K prompts with a needle, then decode). The pelican generation gate (a 24-panel
  storyboard, up to 48K tokens, >= 20 complete drawings) is not scored and is run separately now and then
  (`--pelican`); on this machine the starting code wrote 18 complete drawings and finished normally (21,349
  tokens): greedy text diverges after small numeric differences, so the check is that the reply still finishes
  without degenerating, compared with the starting code;
- `score = sqrt(D * P)`, D = geomean(short decode, decode after ~250K) over the baseline's short decode, P =
  geomean(prefill ~4K, ~32K, ~250K) over the baseline's ~4K / ~32K; the baseline is the starting code on this
  machine (`tasks/ftm_m5_iq4/baseline_m5.json`), so the start scores about 1.0.
- `--quick`: one session, the short decode and the ~4K prefill (`quick_score`), no extra gates (~6 min).
- `python3 tools/ftm_m5_iq4/prefill_probe.py --repo <checkout> [--env KEY=VALUE]`: the ~32K prefill and the short
  decode only (~3 min), an A/B signal for prefill work (not a score).
- Measurement: this laptop's speed drifts by up to ~10% within hours. Decide with interleaved paired quick runs
  (A B A B A B against the current `main`); a full eval for landing; pair it with a same-hour control of the
  previous best and report the ratio.

## Correctness (hard gates; any failure scores 0)
- the harness's: top-1 agreement with llama.cpp >= 98% where its top-2 margin >= 1 nat and >= 90% overall, KL mean
  <= 0.10, p99 <= 1.5; probes well-formed; MLX peak <= 37 GiB, swap growth <= 1 GiB, load time bounded; both
  needles found; decode after ~250K >= 21 tok/s; ~250K prefill >= half the ~32K one; (with `--pelican`) >= 20
  complete drawings in the pelican reply;
- exactness gates of this task (full runs): `tools/check_lossless_ftm_m5.py` (the first session and the decode
  benchmark with the default expert cache and with a 6000-slot one give identical predictions and
  log-probabilities: a lossless engine computes the same function whatever experts are resident) and the test
  suite above.

## Machine rules
- **Stopping a model process.** A model process terminated outright while a GPU command waits on its expert IO
  threads stays stuck (state `E`, its wired memory held) until a reboot. Engines unwind on SIGTERM; never `kill -9`
  a model process. The memory watchdog sends SIGTERM at 42 GiB wired or under 1 GiB available.
- **Host memory outside the MLX budget** (mlocked caches, pinned tiers) counts toward wired memory and the
  watchdog, not toward the 37 GiB MLX gate. Keep wired memory well under 42 GiB.
- **One model at a time.** Every run that loads the model takes an exclusive `flock` on `/tmp/ftm_bench.lock` (the
  harness, the cache-invariance check already do; wrap your own scripts:
  `python -c "import fcntl,os,subprocess,sys; f=open('/tmp/ftm_bench.lock','w'); fcntl.flock(f, fcntl.LOCK_EX); sys.exit(subprocess.call(sys.argv[1:]))" <cmd...>`).

## Rules
1. **Same model, same math.** Serve the GGUF as given: all 48 layers, top-10 routed experts + the shared expert per
   token, the QSA rule, PLE, hyper-connections, the stored block codes and their dequantization. No skipping or
   pruning experts, no lowering top-k, no fewer bits or re-quantization of the model's weights, no approximate
   attention, no KV or state stored at lower precision than the engine computes it in, no reuse of one request's
   outputs for another beyond the standard prefix cache. Reordering floating-point operations, fusing, batching,
   scheduling, IO, memory and caching policy (including paging KV to the SSD and back unchanged), and lossless
   re-layouts of the same bytes are fine.
2. **Speculative decoding only if lossless and reproducible**: drafts from the model's MTP head (more than one
   draft token per step is fine), from the DFlash2 draft model below, or from the request's own tokens; never from
   other requests. The target verifies every emitted token; greedy requests emit exactly the target's argmax, the same
   on every run (which draft rows a step verifies may depend only on the request itself, never on timing or other
   requests); rejected positions leave no trace in KV, GDN state, PLE context or the prefix cache. A draft model's
   memory counts toward the memory gates.
   - DFlash2 draft model: `$HOME/.cache/huggingface/hub/models--incoai--Qwen3.8-Flash-Next-DFlash2/snapshots/*/`
     (`model.safetensors`, 1.2 GB bf16, Apache-2.0; `config.json`: `DFlash2DraftModel`, 5 sliding-window layers
     (window 2048), hidden 2560, block_size 8, conditioned on the target's hidden states at layers 5/15/25/35/45,
     mask token 248077). It was trained against the FP8 release of this model, not this GGUF. Its model card points
     to https://github.com/z-lab/dflash and an SGLang integration (a patch in the model repository) as reference
     implementations. Not a file to modify.
3. Edit only the repository (Python, C++, Metal, its tools and tests). Never modify `tasks/ftm_m5_iq4/harness/`, the
   baseline, the eval or check tools, the GGUF, the MTP files or the DFlash2 files. Derived on-disk formats must be lossless, verified,
   built by a tool committed to the repository, written under `$FTMETAL_MOE_DERIVED_ROOT`; keep at least 150 GiB of
   the disk free.
4. Generalization: changes follow from the hardware and the workload class (agentic multi-turn serving, bs=1 decode,
   long contexts), never from matching the recorded traces or the speed suite's prompts.
5. Keep the mlx pin; use `uv` (Python 3.13) and `.venv`; follow `AGENTS.md`. Log every
   experiment in `tasks/ftm_m5_iq4/results.tsv` (`commit	score	passed	total	status	description`) and commit kept
   improvements to `main` (Conventional Commits, subject only).

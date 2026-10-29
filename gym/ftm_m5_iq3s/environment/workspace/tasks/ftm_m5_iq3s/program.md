# FreeToken-metal on an M5 Pro: Qwen3.8-Flash-Next from its GSQ-RCO IQ3_S GGUF, expert offload, full context

## Task
Make FreeToken-metal (`ftmetal`, an MLX + Metal LLM serving engine) serve **Qwen3.8-Flash-Next from ISTA-DASLab's
GSQ-RCO IQ3_S GGUF** as fast as possible on **this Apple M5 Pro (20-core GPU, 48 GB unified memory, macOS 26.7)**,
where the model (83.6 GB) does not fit in memory and its routed experts stream from the SSD, with the model's whole
262144-token context available, as `ftm serve --model $FTM_GGUF_IQ3S` runs it with no other flags.

- **The file.** `$FTM_GGUF_IQ3S`: `Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-00001-of-00002.gguf` (54.8 GB, the weights) and
  `-00002-of-00002.gguf` (28.8 GB, the PLE n-gram table), with the original model's config and tokenizer beside them.
  RCO assigned one GGML type per tensor (whole-file target 3.50 bpw; the list is
  `tasks/ftm_m5_iq3s/rco-allocation-IQ3_S.txt`):
  - routed experts (48 layers x gate/up/down = 144 tensors): IQ2_S 40, IQ4_NL 39, IQ3_XXS 34, IQ3_S 20, Q2_0 9,
    IQ4_XS 2;
  - shared experts: BF16 48, IQ4_NL 47, Q4_K 30, IQ4_XS 28, Q6_K 26, Q5_K 12, Q8_0 1;
  - everything else: BF16 436, F32 292, Q6_K 103, Q5_K 23, Q4_K 17, IQ4_XS 15, F16 1.
- **Accuracy of this file** (ISTA-DASLab's model card, against the BF16 model): AIME25 100.0 (BF16 100.0), GPQA-Diamond
  92.93 (91.92), LiveCodeBench v6 86.86 (87.43). An engine that matches llama.cpp on this file serves this accuracy.
- **Starting point.** the repository, branch `main` = the final UD-IQ4_XS engine of the EAT Gym task `ftm_m5_iq4` (its
  `program.md` describes the starting point it grew from). Its ggml kernels
  support IQ3_S, IQ4_NL, IQ4_XS, Q6_K and Q8_0 (`python/ftmetal/layers/quantization/ggml.py` `QUANTIZED_TYPES`);
  **IQ2_S, IQ3_XXS, Q2_0, Q4_K and Q5_K are not supported, so the starting code cannot load this file.** Branch
  `m5/gguf` (shared history) has expert kernels for Q4_K / Q5_K / Q5_1 / Q8_0 from an earlier GGUF engine.
- **Reference implementations** of every GGML type here (block layouts, dequantization, CPU and Metal kernels): the
  llama.cpp checkout at `$EAT_REFS/llama.cpp` (commit `fae9ac5`; `ggml/src/ggml-common.h`,
  `ggml/src/ggml-quants.c`, `ggml/src/ggml-metal/ggml-metal.metal`), the same build that produced the correctness
  reference below. Read, do not modify.
- **Hardware fact.** This GPU (Apple M5, `applegpu_g17s`) has matrix units in every GPU core (Apple's "neural
  accelerators"; MLX calls its kernels for them NAX; Metal 4 exposes them through MetalPerformancePrimitives
  `matmul2d` / tensor ops); the M4 has none. In the starting code the ggml matmul uses `matmul2d` on this GPU.
- **Test suite:** `tests/` passes on the starting code except the six cases in `tasks/ftm_m5_iq3s/known_failures.txt`
  (a tiled kernel compared bit-exactly with MLX's `quantized_matmul`; on this GPU the two differ by one bf16
  rounding step at some outputs). Keep everything else green; new kernels and formats get tests. Run it with
  `MLX_ENABLE_TF32=0` (as the eval does).

## Workload and score (the official eval)
`python tools/eval_ftm_m5_iq3s.py` runs `tasks/ftm_m5_iq3s/harness/gguf/run.py` on the repository:
- phase 1, correctness, in-process and teacher-forced: three recorded coding-agent sessions, a decode benchmark and
  a long-output session, compared at every response position with llama.cpp's distributions on this GGUF
  (`traces_iq3s.json`: llama.cpp `fae9ac5`, CPU, teacher-forced, top-20; the recorded token sequences are the same
  as the IQ4_XS task's);
- phase 2, serving: `ftm serve --model $FTM_GGUF_IQ3S`, then the speed suite (decode after a short prompt; prefill at
  ~4K and ~32K; ~128K and ~250K prompts with a needle, then decode);
- `score = sqrt(D * P)`, D = geomean(short decode, decode after ~250K) over the baseline's short decode, P =
  geomean(prefill ~4K, ~32K, ~250K) over the baseline's ~4K / ~32K. **The baseline (`tasks/ftm_m5_iq3s/baseline_m5.json`)
  is the UD-IQ4_XS engine's speed on the UD-IQ4_XS file on this machine** (decode 40.2 tok/s, prefill 989 / 1053 /
  1015 tok/s at ~4K / ~32K / ~250K, decode after ~250K 38.7 tok/s), so a score above 1 is faster than that
  configuration; until the file loads and passes the gates, the score is 0.
- `--quick`: one session, the short decode and the ~4K prefill (`quick_score`), no extra gates.
- `python3 tools/ftm_m5_iq4/prefill_probe.py`-style probes can be written for this file under your work directory.
- Measurement: this laptop's speed drifts by up to ~10% within hours. Decide with interleaved paired quick runs
  (A B A B A B against the current `main`); a full eval for landing; pair it with a same-hour control of the
  previous best and report the ratio.

## Correctness (hard gates; any failure scores 0)
- the harness's: top-1 agreement with llama.cpp >= 98% where its top-2 margin >= 1 nat and >= 90% overall, KL mean
  <= 0.10, p99 <= 1.5; probes well-formed; MLX peak <= 37 GiB, swap growth <= 1 GiB, load time bounded; both
  needles found; decode after ~250K >= 21 tok/s; ~250K prefill >= half the ~32K one;
- exactness gates (full runs): `tools/check_lossless_ftm_m5.py` (default expert cache vs a 6000-slot one: identical
  predictions and log-probabilities) and the test suite above.

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
   token, the QSA rule, PLE, hyper-connections, every tensor's stored block codes and their dequantization as GGML
   defines them. No skipping or pruning experts, no lowering top-k, no fewer bits or re-quantization of the model's
   weights (converting a tensor to a different format is re-quantization unless it is bit-exact), no approximate
   attention, no KV or state stored at lower precision than the engine computes it in, no reuse of one request's
   outputs for another beyond the standard prefix cache. Reordering floating-point operations, fusing, batching,
   scheduling, IO, memory and caching policy (including paging KV to the SSD and back unchanged), and lossless
   re-layouts of the same bytes are fine.
2. **Speculative decoding only if lossless and reproducible**: drafts from the model's MTP head (more than one draft
   token per step is fine), from the DFlash2 draft model described in `tasks/ftm_m5_iq4/program.md`, or from the
   request's own tokens; never from other requests. The target verifies every emitted token; greedy requests emit
   exactly the target's argmax, the same on every run; rejected positions leave no trace in KV, GDN state, PLE context
   or the prefix cache. A draft model's memory counts toward the memory gates.
3. Edit only the repository (Python, C++, Metal, its tools and tests). Never modify `tasks/ftm_m5_iq3s/harness/`, the
   baseline, the eval or check tools, the GGUF, the MTP or DFlash2 files, or the llama.cpp reference checkout. Derived
   on-disk formats must be lossless, verified, built by a tool committed to the repository, written under
   `$FTMETAL_MOE_DERIVED_ROOT`; keep at least 150 GiB of the disk free.
4. Generalization: changes follow from the hardware and the workload class (agentic multi-turn serving, bs=1 decode,
   long contexts), never from matching the recorded traces or the speed suite's prompts.
5. Keep the mlx pin; use `uv` (Python 3.13) and `.venv`; follow `AGENTS.md`. Log every experiment
   in `tasks/ftm_m5_iq3s/results.tsv` (`commit	score	passed	total	status	description`) and commit kept
   improvements to `main` (Conventional Commits, subject only).

## Hard Requirements (MUST be in every agent's prompt)
1. The task is `tasks/amd_kda_mi350x`: Kimi Delta Attention prefill on AMD Instinct MI350X (gfx950, CDNA4, ROCm/HIP — NOT CUDA/NVIDIA). Every agent must read `tasks/amd_kda_mi350x/program.md` in full and `CLAUDE.md` before working.
2. Goal: beat the current SOTA (vLLM's hand-written ROCm KDA kernels, in `tasks/amd_kda_mi350x/sota/`). The starting `kernel.cu` is a faithful port of that SOTA kernel (~0.99). Score = `mean_vs_base` from `python tools/eval_amd_kda_mi350x.py` (all 10 workloads); correctness on every workload is a hard constraint.
3. All sources are readable and reusable (SOTA kernel, AITER, fla, vLLM, FlashInfer, FlashAttention-4, GPU MODE kernels under `$EAT_REFS/`), and profiling any kernel including the baselines is allowed. The final kernel may be HIP C++ (`kernel.cu`) or Gluon/Triton (`kernel.py`), as described in program.md.
4. The score is `mean_vs_base` on the 10 eval workloads only. Held-out batch shapes (not in the eval) are checked for correctness and against special-casing, not scored: a gain that appears only on non-eval shapes is not progress. Dispatch logic must follow from a cost model, never from matching the 10 eval shapes; check policy changes on a few shapes of your own.
5. Do NOT modify `tasks/amd_kda_mi350x/sota/`, `baseline_*.json`, `reference.py`, or `tools/eval_amd_kda_mi350x.py`. Do not push to any git remote.
6. Environment for every shell command:
   `cd $EAT_ROOT && source $EAT_VENV/bin/activate && export TRITON_CACHE_DIR=$EAT_CACHE/triton HIP_VISIBLE_DEVICES=<gpu>`
   Only the GPUs listed in `$EAT_GPUS` (HIP numbering) may ever be used (other GPUs on a shared machine belong to other users; `rocm-smi` indices can differ from HIP numbering — never pick GPUs by rocm-smi index). Keep all files under `$EAT_WORK`. Wrap long-running or possibly-hanging runs in `timeout`.

## Shared Environment
All agents run in the SAME working directory (`$EAT_ROOT`) and share the GPUs.

### File ownership (MUST be in every agent's prompt)
- The eval always builds `tasks/amd_kda_mi350x/kernel.cu` + `kernel.h` + `main.cpp` (or imports `kernel.py` if it exists). Agents MUST NOT leave their work-in-progress in those files. Each agent works on its own copies (e.g. `tasks/amd_kda_mi350x/kernel_<role_name>.cu`, `main_<role_name>.cpp`) and only copies them into place to eval, then restores the originals — unless it is the agent designated to commit a new best kernel.
- Tell each agent which files it owns (may create/edit) and which it must not touch.
- The agent that produces a new best kernel must leave it in `kernel.cu`/`kernel.h`/`main.cpp`, save a snapshot in `tasks/amd_kda_mi350x/solutions/`, and append a row to `tasks/amd_kda_mi350x/results.tsv` (commit, mean_vs_base, passed, total, status, description). Log discarded experiments in results.tsv too.

### GPU access (MUST be in every agent's prompt)
- Tell each agent whether it may use the GPU (build+run kernels, run eval, profile).
- Because the eval builds the shared `kernel.cu`, only ONE GPU-using agent may run per phase. That agent may use all allowed GPUs (`$EAT_GPUS`), e.g. to run experiments in parallel from its own copies via small standalone harnesses; it must use the official eval (from the shared files) for reported scores.
- If an agent may not use the GPU, tell it to only read/write code and notes, not compile or run anything on the GPU.
- Put GPU-using agents in separate phases. Read-only agents (e.g. research, analysis of reference kernels) can run in parallel with a GPU-using agent.

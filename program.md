# GPU Kernel Optimization — Agent Program

This is the default loop for a single agent optimizing a task's kernel. In a team run, the supervisor's role
prompts take precedence where they differ.

## Setup (once per task)
1. Read `tasks/<task>/program.md` (algorithm, API, dimensions, target GPU, rules) and the key files: `kernel.cu`,
   `kernel.h`, `main.cpp`, `reference.py`.
2. Make sure the baseline latencies exist (`tasks/<task>/baseline_*.json`); they are reused for every comparison.
3. Work on a branch: `git checkout -b <task>/<run_tag>`, and keep `tasks/<task>/results.tsv` with the header
   `commit	mean_vs_base	passed	total	status	description`.

## Goal
**Maximize `mean_vs_base`** = mean(baseline_latency / your_latency) across all eval workloads. Correctness is a
hard constraint — all workloads must pass.

## The experiment loop
1. **Read current state**: git log, `results.tsv`, the current kernel.
2. **Analyze**: profile and find the dominant bottleneck (bandwidth, compute, pipeline bubbles, launch overhead).
3. **Propose**: target that bottleneck and estimate the expected gain.
4. **Implement** in the kernel files.
5. **Quick eval**, then the **full eval** if it passes. On compile errors, read the output and fix.
6. **Log** the result in `results.tsv` (`keep`, `discard`, `crash`, or `incorrect`).
7. **If improved and correct**: commit, and save the kernel to `tasks/<task>/solutions/kernel_vN_SCOREx.cu`.
   **Otherwise**: return to the best commit and try something different.
8. Repeat.

## Key rules
- Commit each kept experiment; save the working kernel before a major rewrite.
- Never re-run or re-record the baseline.
- Quick eval first to catch failures early; report only full-eval scores.

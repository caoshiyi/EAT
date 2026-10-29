## Hard Requirements (MUST be in every agent's prompt)
1. The task is `tasks/ftm_m5_iq3s`: Serve Qwen3.8-Flash-Next from ISTA-DASLab's GSQ-RCO IQ3_S GGUF (84 GB, 13 GGML types) on an Apple M5 Pro 48 GB. Every agent must read `tasks/ftm_m5_iq3s/program.md` in full, `AGENTS.md`
   and `CLAUDE.md` before working.
2. Score: `bash eat/eval.sh` (last line `SCORE: <x>`, 0 if any gate fails); `program.md` defines the score and the gates.
   Decide with interleaved paired quick runs (`python3 tools/eval_ftm_m5_iq3s.py --quick`); land with a full eval paired with a
   same-hour control of the previous best.
3. Edit only the engine (Python, C++, Metal, its tools and tests). Never modify `tasks/ftm_m5_iq3s/harness/`,
   `tasks/ftm_m5_iq3s/baseline_m5.json`, `tools/eval_ftm_m5_iq3s.py`, `tools/check_lossless_ftm_m5.py`, the GGUF or the reference
   checkout under `$EAT_REFS`. Do not push to any git remote.
4. One model process at a time: every run that loads the model takes an exclusive `flock` on `/tmp/ftm_bench.lock`.
   Stop a model process with SIGTERM, never `kill -9` (a GPU command waiting on its IO threads stays stuck until a reboot).
5. Environment for every shell command: `cd $EAT_ROOT && source eat/env.sh`; Python through `uv run` / `.venv`.

## Shared Environment
All agents share this repository and the one GPU. Each agent works in its own git worktree under `$EAT_WORK/wt_<role>`
(own `.venv`), never in the shared checkout. Only one agent per phase runs model processes. The agent that lands a new
best commits it to `main` and logs it in `tasks/ftm_m5_iq3s/results.tsv` (commit, score, passed, total, status, description);
discarded experiments are logged there too.

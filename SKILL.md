---
name: eat
description: Set up and run EAT (Evolving Agent Teams) on a task, where a supervisor agent designs, runs and evolves teams of Claude Code agents to maximize a score. Use when the user asks to set up EAT, run EAT on the current repository or on an EAT Gym task, or to check on, pause, stop or resume an EAT run.
---

# EAT

`EAT_HOME` is the directory of this file: `${CLAUDE_SKILL_DIR}` (set `EAT_HOME="${CLAUDE_SKILL_DIR}"` in every shell
command below). The harness is `$EAT_HOME/agent_team/launch_stateless.sh`;
it runs from inside the task's git repository and needs three files there:

| file | what it is |
|---|---|
| `eat/task.md` | the rules the supervisor puts into every agent's prompt (task, goal, eval, files, resources, limits) |
| `eat/eval.sh` | the official eval of the committed state; prints a line `SCORE: <x>` (higher is better, 0 on any correctness failure) |
| `eat/env.sh` | optional: sourced before anything runs (venv, paths, `EAT_GPUS`, `TEAM_WALL_MIN`: a team's wall-clock limit in minutes) |
| `eat/pre_team.sh`, `eat/snapshot.sh`, `eat/done.sh` | optional: run before each team (e.g. start a game server), after it (its output is kept with the iteration), and after each iteration (exit 0 ends the run: the task is finished) |

A `CLAUDE.md` in the repository is read by every agent. The run's record goes to `eat/log/` (team configs, every
agent's prompt and output, the official eval of each iteration, `BUDGET.md`), and each iteration ends with a commit
`iter <n>: ... score=<x>`.

## 1. Check the machine

- Linux or macOS with `claude`, `git`, `tmux`, `python3` (3.11+); for Gym tasks also `uv` and `hf` (`pip install -U huggingface_hub`).
  On macOS the harness brings its own `timeout` (`ops/macbin`).
- Claude auth for non-interactive runs: the harness unsets `ANTHROPIC_API_KEY`, so `claude` must be logged in, or
  `CLAUDE_CODE_OAUTH_TOKEN` set (`claude setup-token`). Check with `claude --print "reply ok"`.
- Agents run with `--dangerously-skip-permissions`. Tell the user and get their OK for this machine (or use
  `cleanroom/sandbox.sh`).
- GPUs: list them (`nvidia-smi` / `rocm-smi`, and who else uses them) and ask which ones the run may use. On a shared
  machine never take GPUs the user did not give you.

## 2a. An EAT Gym task

The tasks are listed in the README of the Hugging Face dataset `eva98/eat-gym`
(`hf download eva98/eat-gym README.md --repo-type dataset --local-dir /tmp/eat-gym`); each needs specific hardware
(its `environment/README.md`).

```bash
bash $EAT_HOME/ops/fetch_task.sh <task> <dir> --setup   # the task as its own repository, with venv, references, baselines
cd <dir> && EAT_GPUS="0 1" bash eat/eval.sh             # the start state's score
```

The task already has `eat/` and `CLAUDE.md`. Continue with step 3.

## 2b. The user's own repository

Work out with the user, briefly, then write the files and show them for approval:

1. **Score**: the one number to maximize and how it is measured. Turn lower-is-better metrics into higher-is-better
   (e.g. baseline time / time). Correctness failures score 0.
2. **`eat/eval.sh`**: runs the measurement on the current state of the repository and ends with `SCORE: <x>`. It must
   not depend on files the agents edit (keep the eval, references and test data out of their reach in `task.md`),
   should finish in minutes if possible, and its noise should be known (run it 2-3 times).
3. **`eat/task.md`**, starting with `## Hard Requirements (MUST be in every agent's prompt)`:
   - the task and goal, what to read first (README, `CLAUDE.md`), and the eval command;
   - which files may change and which must not (the eval, references, tests, data);
   - resources: which GPUs (`$EAT_GPUS`) or machines, how to run on them, time limits per command;
   - sources: what may be read or used (the web, other code, libraries), and anything off limits;
   - honesty: no special-casing the eval's inputs; results must hold for any valid input;
   - do not push to any git remote.
   Then `## Shared Environment`: all agents share one working directory, so each agent works on its own copies (e.g.
   `work_<role>/`) and only the agent that ships a new best puts it in place, saves a snapshot and logs it in a results
   file. A Gym task's `eat/task.md` is a good example (`$EAT_HOME/ops/fetch_task.sh` caches them in `~/.cache/eat-gym`).
4. **`eat/env.sh`** if commands need an environment (venv activation, paths, `export EAT_GPUS="${EAT_GPUS:-0}"`).
5. Add `.work/` and `eat/log/.supervisor_*` to `.gitignore`, run `bash eat/eval.sh` to record the start score, and
   commit (`git add -A && git commit -m "EAT task setup"`). Work on a branch if the user prefers (`git checkout -b eat/run1`).

## 3. Launch

Confirm with the user: the budget in dollars, the maximum number of iterations and team size, and optionally the
models and settings below. Then start the run in tmux from the repository:

```bash
mkdir -p .work
tmux new-session -d -s eat_<name> "export EAT_GPUS='0 1'; bash $EAT_HOME/agent_team/launch_stateless.sh --persistent 50 3 300 2>&1 | tee -a .work/eat.log"
```

Arguments: `--persistent` (one supervisor session for the whole run; recommended), max iterations, max team size,
budget in dollars, first iteration (default 1). Optional environment:

| variable | effect |
|---|---|
| `SUPERVISOR_MODEL`, `AGENT_MODELS` | the supervisor's model; comma-separated models a role may pick with `**Model:**` |
| `SUPERVISOR_REFRESH_COST` | a supervisor turn costing more than this many dollars hands over to a new session (default off) |
| `AGENT_TIMEOUT_ENFORCE=1` | stop agents at the `**Timeout:**` of their role (they are resumed once for a final report) |
| `EAT_PAUSE_FILE` | the run waits before each iteration while this file exists |
| `CLAUDE_EXTRA_DISALLOWED` | tools denied to every session, e.g. `WebSearch,WebFetch` |

## 4. Monitor, pause, stop, resume

- **Status**: `tail -40 .work/eat.log`; `eat/log/BUDGET.md` (cost and score per iteration);
  `git log --oneline | grep 'iter '`; the latest `eat/log/iter_<n>/official_eval.txt`; `tmux ls`.
- **A note to the team**: write it to `eat/log/OPERATOR_NOTES.md`; it is appended to every team's output that the
  supervisor reads. Give information, not optimization hints.
- **Pause** between iterations: start with `EAT_PAUSE_FILE=<path>` and create that file.
- **Stop**: `tmux kill-session -t eat_<name>`, then stop leftover agents (`pgrep -af "claude --print"`; kill only
  this run's).
- **Resume**: the next iteration is the last `iter <n>:` commit + 1. To keep the supervisor's memory, pass its session
  id (`grep "persistent session" .work/eat.log | tail -1`) as `RESUME_SESSION_ID`, and the iteration as the last
  argument (`--persistent <iterations> <team size> <budget> <first iteration>`). The cost so far is read back from `eat/log/BUDGET.md`.
- **Verify** an iteration independently: `source $EAT_HOME/ops/env.sh && python3 $EAT_HOME/ops/verify_iter.py <n>`
  (three evals of that commit in a worktree).

Report costs as you go, and never edit the eval or the task's rules in the middle of a run without telling the user.

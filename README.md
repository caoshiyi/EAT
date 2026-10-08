# EAT: Evolving Agent Teams

EAT is a harness in which a **supervisor** agent repeatedly designs, launches and revises a **team** of coding agents
(Claude Code) that optimize a GPU kernel against a fixed eval. The supervisor never writes kernel code; its only
output each iteration is a team configuration (roles, prompts, phases, ownership of files and GPUs). The team does
the work, the harness runs the official eval, and the supervisor reflects on the result and evolves the team.

```
while budget remains:
    supervisor:  REFLECT on the previous team's output -> EVOLVE roles / prompts / workflow -> emit TEAM_CONFIG
    harness:     launch the team's agents phase by phase -> run the official eval -> record cost and score
```

## Layout

```
agent_team/
  launch_stateless.sh    supervisor loop (persistent or stateless supervisor sessions), budget accounting
  launch_team.sh         runs one team: parses TEAM_CONFIG, launches agents per phase, official eval, TEAM_OUTPUT.md
  parse_team_config.py   TEAM_CONFIG -> per-role prompt files and a phase plan
  extract_result.py      final text of a `claude --print --output-format json` run
  SUPERVISOR.md          the supervisor's instructions (how to reflect and evolve, not how to optimize kernels)
  requirements/<task>.md hard rules the supervisor must put into every agent prompt (environment, files, GPUs)
ops/
  env.sh                 node settings (paths, task, GPUs) used by the scripts below
  pick_eval_gpu.sh       pick an idle GPU from $EAT_GPUS for the official eval (ROCm or NVIDIA)
  gpu_run                run a command on an NVIDIA GPU nobody else uses; preempts itself if someone arrives
  rotate_supervisor.sh   long runs: replace the persistent supervisor session when its turns get expensive
  curve_data.py          export per-iteration cost / score / team / ships as JSON
  verify_iter.py         re-run an iteration's committed kernel independently (3 evals + optional extra check)
  curve_loop.sh          export the curve every 5 min and verify each new best automatically
cleanroom/
  sandbox.sh             bubblewrap sandbox: only listed sources visible, network only to the Anthropic API
  allowlist_proxy.py     HTTPS CONNECT proxy that only passes the allowlisted hosts (logs every request)
  tcp2unix.py            bridge from the sandbox's loopback to the proxy socket
  audit_clean_traces.py  scan every tool call in a run's transcripts for web use, network, forbidden sources
  audit_code_overlap.py  line-level overlap of the candidate code with allowed vs forbidden sources
  audit_after_iter.sh    run both audits after iteration N completes
tasks/<task>/            task spec (program.md), starting kernel, reference, baselines, refs.txt
tools/eval_<task>.py     the task's official eval (prints mean_vs_base)
```

## Running a task

Requirements: Linux, Claude Code (`claude`) logged in or `CLAUDE_CODE_OAUTH_TOKEN` set, git, tmux, and the task's
own toolchain (for `amd_kda_mi350x`: an MI350X/MI355X GPU, ROCm, PyTorch for ROCm, `flash-linear-attention`).

```bash
export EAT_GPUS="0 1"                # GPUs the run may use
source ops/env.sh                    # defaults: work dir .work/, refs .work/refs, venv .work/venv
bash tasks/amd_kda_mi350x/fetch_refs.sh          # reference repos the agents may read
bash tasks/amd_kda_mi350x/sota/build.sh          # build the vLLM baseline once
git checkout -b amd_kda_mi350x/run1               # the team commits its progress here
export EVAL_CMD='source $EAT_VENV/bin/activate && export TRITON_CACHE_DIR=$EAT_CACHE/triton HIP_VISIBLE_DEVICES=$(ops/pick_eval_gpu.sh) && python tools/eval_amd_kda_mi350x.py'
tmux new-session -d -s ${EAT_SESSION}1 \
  "bash agent_team/launch_stateless.sh --persistent amd_kda_mi350x 80 3 3000 1 2>&1 | tee -a $EAT_LOG"
```

Arguments: mode, task, max iterations, max team size, budget in dollars, first iteration. Each iteration leaves
`agent_team/iter_<n>/` (team config, every agent's prompt and output, the official eval) and a commit
`iter <n>: task=... cost=... score=...`; `agent_team/BUDGET.md` accumulates cost and score.
Agents run with `--dangerously-skip-permissions`: run on a machine (or in `cleanroom/sandbox.sh`) where that is acceptable.

### The chess task

`tasks/chess` applies the same loop to a task that is not code: the team plays a stream of 200 rated games against
Stockfish (fixed schedule, one game at a time; the supervisor decides how many each team plays) and the score is its Elo over the last 50 rated
games. The team makes every move itself; `tools/chess_arena.py` owns the board and records every move in a
hash-chained ledger (`tasks/chess/arena/`), and the team keeps whatever it wants to remember in `tasks/chess/team/`.

```bash
export EAT_TASK=chess && source ops/env.sh
python3 -m venv $EAT_VENV && $EAT_VENV/bin/pip install chess          # python-chess
(mkdir -p $EAT_WORK/dl && cd $EAT_WORK/dl && apt-get download stockfish && dpkg -x stockfish_*.deb $EAT_WORK/engine)
git checkout -b chess/run1
export SCORE_KEY=elo CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch EAT_MODEL=<model id>
export EVAL_CMD='source $EAT_VENV/bin/activate && python tools/eval_chess.py --end-iteration'
export STOP_CMD='source $EAT_VENV/bin/activate && python tools/eval_chess.py --done'     # stop once all 200 are played
tmux new-session -d -s ${EAT_SESSION}1 \
  "bash agent_team/launch_stateless.sh --persistent chess 100 3 300 1 2>&1 | tee -a $EAT_LOG"
$EAT_VENV/bin/python tools/chess_viewer.py --port 17777               # live page: rating, board, games, teams
```

The iteration limit is only a ceiling: the run stops when the 200 games are played. The engine is unpacked under `.work/`, off `PATH`; the rules forbid the
agents any engine or position-searching code, and `cleanroom/audit_clean_traces.py` checks the transcripts.

### Clean-room runs

To show that a result was not copied from code released after a cutoff, run the whole loop inside
`cleanroom/sandbox.sh` with only pre-cutoff sources mounted (`EAT_ALLOWED_RO`), web tools disabled
(`CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch`) and network limited to the Anthropic API by the proxy; then audit
the transcripts and the produced code with `cleanroom/audit_*.py`.

## Results

| task | hardware | baseline | result | iterations | cost |
|---|---|---|---|---|---|
| `amd_kda_mi350x`: Kimi Delta Attention prefill | AMD MI350X | vLLM ROCm KDA kernels | 3.01x mean speedup (independently verified; harness 2.99-3.03x) | 73 | $3,018 |

The kernels are released in [eat-kernels](https://github.com/caoshiyi/eat-kernels) and the full evolution traces (every supervisor and agent transcript, team
configs, notes, per-iteration kernels) in the Hugging Face dataset [eva98/eat-evolution-traces](https://huggingface.co/datasets/eva98/eat-evolution-traces) (`amd_kda_mi350x/`).

## License

Apache-2.0. `tasks/amd_kda_mi350x/sota/` contains code from vLLM (Apache-2.0); see NOTICE.

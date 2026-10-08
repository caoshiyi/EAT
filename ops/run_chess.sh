#!/bin/bash
# Start the chess run of this checkout, or continue it where it stopped (the same command does both):
#   bash ops/run_chess.sh MODEL [max_team_size]        e.g. bash ops/run_chess.sh haiku
# No dollar limit; the run ends when the 200 rated games are played. Usage limits are waited out.
set -euo pipefail
cd "$(dirname "$0")/.."
export EAT_TASK=chess EAT_MODEL="${1:?usage: run_chess.sh MODEL [max_team_size]}"
source ops/env.sh
export SCORE_KEY=elo CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch
export EVAL_CMD='source $EAT_VENV/bin/activate && python tools/eval_chess.py --end-iteration'
export STOP_CMD='source $EAT_VENV/bin/activate && python tools/eval_chess.py --done'
bash agent_team/launch_stateless.sh --persistent chess 1000 "${2:-3}" none auto 2>&1 | tee -a "$EAT_WORK/eat_chess.log"

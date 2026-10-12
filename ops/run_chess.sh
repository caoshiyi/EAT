#!/bin/bash
# Start the chess run of this checkout, or continue it where it stopped (the same command does both):
#   bash ops/run_chess.sh MODEL LADDER [max_team_size]   e.g. bash ops/run_chess.sh haiku haiku
# LADDER: opus | haiku | low | adaptive30 (ops/chess_ladder.sh). A team is stopped after 2 hours (TEAM_WALL_MIN). The run has its own Claude
# Code memory. No dollar limit; the run ends when the 200 rated games are played. Usage limits are waited out.
set -euo pipefail
cd "$(dirname "$0")/.."
export EAT_TASK=chess EAT_MODEL="${1:?usage: run_chess.sh MODEL LADDER [max_team_size]}"
unset EAT_ROOT EAT_WORK EAT_REFS EAT_VENV EAT_CACHE EAT_LOG EAT_SESSION EAT_CLAUDE_SETTINGS   # this checkout's own paths, never ones left in a reused shell
source ops/env.sh
bash ops/chess_ladder.sh "${2:?usage: run_chess.sh MODEL LADDER [max_team_size]}" || exit 1
export TEAM_WALL_MIN="${TEAM_WALL_MIN:-120}"
mkdir -p "$EAT_WORK/claude_memory"
export EAT_CLAUDE_SETTINGS="{\"autoMemoryDirectory\": \"$EAT_WORK/claude_memory\"}"
export SCORE_KEY=elo CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch
export EVAL_CMD='source $EAT_VENV/bin/activate && python tools/eval_chess.py --end-iteration'
export STOP_CMD='source $EAT_VENV/bin/activate && python tools/eval_chess.py --done'
# the game clock (runs with one) is running only while a team is: started here, stopped by eval_chess.py --end-iteration
export PRE_TEAM_CMD='source $EAT_VENV/bin/activate && CHESS_HARNESS=1 python tools/chess_arena.py clock resume'
bash agent_team/launch_stateless.sh --persistent chess 1000 "${3:-3}" none auto 2>&1 | tee -a "$EAT_WORK/eat_chess.log"

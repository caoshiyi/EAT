#!/bin/bash
# Start the Minecraft run of this checkout, or continue it where it stopped (the same command does both):
#   bash ops/run_minecraft.sh MODEL [max_team_size]          e.g. bash ops/run_minecraft.sh claude-opus-5-5 4
#   EAT_AGENT_CLI=codex CODEX_EFFORT=medium bash ops/run_minecraft.sh MODEL   Codex agents (codex login first)
# One-time setup: bash tasks/minecraft/setup.sh. The world runs only while a team does: started before each team,
# saved and stopped before the official eval. A team is stopped after TEAM_WALL_MIN (default 120). The run ends
# when the dragon is defeated. No dollar limit; usage limits are waited out.
set -euo pipefail
cd "$(dirname "$0")/.."
export EAT_TASK=minecraft EAT_MODEL="${1:?usage: run_minecraft.sh MODEL [max_team_size]}"
unset EAT_ROOT EAT_WORK EAT_REFS EAT_VENV EAT_CACHE EAT_LOG EAT_SESSION EAT_CLAUDE_SETTINGS   # this checkout's own paths, never ones left in a reused shell
[ "${EAT_AGENT_CLI:-}" = codex ] && export EAT_AGENT_CLI="$(pwd)/agent_team/codex_cli.py"
source ops/env.sh
export TEAM_WALL_MIN="${TEAM_WALL_MIN:-120}"
mkdir -p "$EAT_WORK/claude_memory"
export EAT_CLAUDE_SETTINGS="{\"autoMemoryDirectory\": \"$EAT_WORK/claude_memory\"}"
export SCORE_KEY=milestones CLAUDE_EXTRA_DISALLOWED=WebSearch,WebFetch
export PRE_TEAM_CMD='python3 tools/mc_arena.py up'
export EVAL_CMD='python3 tools/mc_arena.py down; python3 tools/eval_minecraft.py; python3 tools/eval_minecraft.py --audit'
export STOP_CMD='python3 tools/eval_minecraft.py | grep -q "^dragon = 1"'
bash agent_team/launch_stateless.sh --stateless minecraft 1000 "${2:-4}" none auto 2>&1 | tee -a "$EAT_WORK/eat_minecraft.log"

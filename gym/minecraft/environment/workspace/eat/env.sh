# Environment of minecraft, sourced before the agents, the eval and environment/setup.sh run.
export EAT_ROOT="${EAT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)}"
export EAT_WORK="${EAT_WORK:-$EAT_ROOT/.work}"
export EAT_VENV="${EAT_VENV:-$EAT_WORK/venv}"
export TEAM_WALL_MIN="${TEAM_WALL_MIN:-120}"          # a team is stopped after 2 hours
export CLAUDE_EXTRA_DISALLOWED="${CLAUDE_EXTRA_DISALLOWED:-WebSearch,WebFetch}"
if [ -f "$EAT_VENV/bin/activate" ]; then source "$EAT_VENV/bin/activate"; fi

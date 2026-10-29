#!/bin/bash
# Environment of chess. Run after fetch_task.sh copied workspace/ into $EAT_ROOT:
#     (cd $EAT_ROOT && source eat/env.sh && bash <task>/environment/setup.sh)
set -euo pipefail
: "${EAT_ROOT:?}"
cd "$EAT_ROOT"
uv venv -q --python 3.12 "$EAT_VENV" && uv pip install -q --python "$EAT_VENV/bin/python" chess==1.11.2
command -v stockfish >/dev/null || { [ "$(uname)" = Darwin ] && brew install stockfish || sudo apt-get install -y stockfish; }
# The run configuration: Stockfish 1500-2400 (10 levels, shuffled rotations of 20, levels hidden), then 2000-2900
# from rated game 62 on.
mkdir -p "$EAT_ROOT/.work" && echo '{"ladder": [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400], "seed": 1, "phases": [{"from": 62, "ladder": [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900]}]}' > "$EAT_ROOT/.work/chess_run.json"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init -q -b main
git -c user.name=eat-gym -c user.email=eat-gym@localhost add -A
git -c user.name=eat-gym -c user.email=eat-gym@localhost commit -q -m "start state of chess" || true
echo "ENV_READY chess"

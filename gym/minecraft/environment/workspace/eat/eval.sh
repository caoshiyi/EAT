#!/bin/bash
# Official eval of minecraft, run by the harness after each team; the last line is "SCORE: <x>" (milestones).
cd "$(dirname "$0")/.."
source eat/env.sh
LOG=$(mktemp); trap 'rm -f "$LOG"' EXIT
{ python3 tools/mc_arena.py down; python3 tools/eval_minecraft.py; python3 tools/eval_minecraft.py --audit; } 2>&1 | tee "$LOG"
python3 - "$LOG" <<'PY'
import re, sys
m = re.findall(r"^milestones = (-?[0-9.]+)", open(sys.argv[1]).read(), re.M)
print(f"SCORE: {float(m[-1]) if m else 0.0}")
PY

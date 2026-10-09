#!/bin/bash
# The single-agent baseline of the chess task: ONE Claude Code session given a native /goal (tasks/chess/solo_goal.txt:
# the objective itself, the rating; /goal is the hook that keeps the session going when it would stop),
# no supervisor and no team; its context is managed by Claude Code's own compaction. Start it, or continue it where it
# stopped, with the same command:
#   bash ops/run_chess_solo.sh MODEL
# The session works until the goal is met (all 200 rated games played). A usage limit is waited out (claude_retry.sh);
# if the session stops early it is resumed with the same goal; three calls in a row without a new move end the run.
set -uo pipefail
cd "$(dirname "$0")/.."
MODEL="${1:?usage: run_chess_solo.sh MODEL}"
export EAT_TASK=chess
source ops/env.sh
PY="$EAT_VENV/bin/python"
LOG_DIR=agent_team/solo; mkdir -p "$LOG_DIR"
SID_FILE="$LOG_DIR/.session_id"
[ -f "$SID_FILE" ] || python3 -c "import uuid; print(uuid.uuid4())" > "$SID_FILE"
SID="$(< "$SID_FILE")"
# Claude Code keeps its own memory per git repository, so checkouts of one repository share it: give this run its own
MEMORY_DIR="$EAT_WORK/claude_memory"; mkdir -p "$MEMORY_DIR"
BUDGET=agent_team/BUDGET.md
[ -f "$BUDGET" ] || printf '# Cost (single agent, no limit)\n| Call | Role | Cost ($) | Cumulative ($) | Score |\n|------|------|----------|----------------|-------|\n' > "$BUDGET"
moves() { if [ -f tasks/chess/arena/ledger.jsonl ]; then wc -l < tasks/chess/arena/ledger.jsonl; else echo 0; fi; }
idle=0
n=$(ls "$LOG_DIR"/call_*.json 2>/dev/null | wc -l)
echo "[solo] model $MODEL, session $SID, $n earlier call(s)"
until "$PY" tools/eval_chess.py --done; do
    n=$((n + 1)); before=$(moves)
    echo "[solo] $(date -u +%H:%M:%SZ) call $n: $("$PY" tools/chess_arena.py status | head -1)"
    CR_SESSION_ID="$SID" CR_NO_NOTE=1 bash agent_team/claude_retry.sh tasks/chess/solo_goal.txt "$LOG_DIR/call_$n.json" \
        "$LOG_DIR/stderr.log" 0 -- --model "$MODEL" --dangerously-skip-permissions --output-format json \
        --disallowedTools "WebSearch,WebFetch" \
        --settings "{\"autoMemoryDirectory\":\"$MEMORY_DIR\"}"
    "$PY" tools/eval_chess.py > "$LOG_DIR/eval_$n.txt" 2>&1
    elo=$(grep -oE '^elo = -?[0-9]+' "$LOG_DIR/eval_$n.txt" | grep -oE '\-?[0-9]+$')
    python3 - "$LOG_DIR/call_$n.json" "$BUDGET" "$n" "${elo:-}" <<'PYEOF'
import json, sys
out, budget, n, elo = sys.argv[1:5]
try:
    cost = float(json.load(open(out)).get("total_cost_usd", 0))
except Exception:
    cost = 0.0
total = 0.0
for line in open(budget):
    c = [x.strip() for x in line.split("|")]
    if len(c) >= 6 and c[1].isdigit():
        try: total = float(c[4])
        except ValueError: pass
open(budget, "a").write(f"| {n} | solo | {round(cost, 4)} | {round(total + cost, 4)} | {elo} |\n")
PYEOF
    git add -A >/dev/null 2>&1; git commit -q -m "solo call $n: $("$PY" tools/chess_arena.py status | head -1 | cut -c1-60) elo=${elo:-}" --allow-empty 2>/dev/null || true
    if [ "$(moves)" = "$before" ]; then idle=$((idle + 1)); else idle=0; fi
    if [ "$idle" -ge 3 ]; then echo "[solo] three calls in a row made no move. Stopping; run the same command to continue."; exit 1; fi
done
echo "[solo] all rated games are played."

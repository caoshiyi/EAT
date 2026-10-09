#!/bin/bash
# The single-agent setting of the chess task: ONE Claude Code session following program.chess.md, no supervisor and no
# time limit. When the session stops before the 200 rated games are played, it is told "keep going" (what a person
# watching the session would do). Start or continue with the same command:
#   bash ops/run_chess_single.sh MODEL
set -uo pipefail
cd "$(dirname "$0")/.."
MODEL="${1:?usage: run_chess_single.sh MODEL}"
export EAT_TASK=chess
source ops/env.sh
PY="$EAT_VENV/bin/python"
LOG=agent_team/single; mkdir -p "$LOG"
[ -f "$LOG/session_id" ] || python3 -c "import uuid; print(uuid.uuid4())" > "$LOG/session_id"
SID="$(< "$LOG/session_id")"
MEMORY_DIR="$EAT_WORK/claude_memory"; mkdir -p "$MEMORY_DIR"   # this run's own Claude Code memory (not shared with other checkouts)
ARGS=(--print --model "$MODEL" --dangerously-skip-permissions --output-format json --disallowedTools "WebSearch,WebFetch"
      --settings "{\"autoMemoryDirectory\":\"$MEMORY_DIR\"}")
moves() { if [ -f tasks/chess/arena/ledger.jsonl ]; then wc -l < tasks/chess/arena/ledger.jsonl; else echo 0; fi; }
n=$(ls "$LOG"/call_*.json 2>/dev/null | wc -l); idle=0
until "$PY" tools/eval_chess.py --done; do
    n=$((n + 1)); before=$(moves)
    echo "[single] $(date -u +%H:%M:%SZ) call $n: $("$PY" tools/chess_arena.py status | head -1)"
    if compgen -G "$HOME/.claude/projects/*/$SID.jsonl" > /dev/null; then
        echo "keep going" | claude "${ARGS[@]}" --resume "$SID" > "$LOG/call_$n.json" 2>> "$LOG/stderr.log"
    else
        echo "Read program.chess.md and follow it." | claude "${ARGS[@]}" --session-id "$SID" > "$LOG/call_$n.json" 2>> "$LOG/stderr.log"
    fi
    git add -A > /dev/null 2>&1; git commit -q -m "single call $n: $("$PY" tools/chess_arena.py status | head -1 | cut -c1-60)" --allow-empty 2>/dev/null || true
    if [ "$(moves)" = "$before" ]; then idle=$((idle + 1)); else idle=0; fi
    if [ "$idle" -ge 3 ]; then echo "[single] three calls in a row made no move; stopping (check the session; a usage limit?)."; exit 1; fi
done
echo "[single] all rated games are played."

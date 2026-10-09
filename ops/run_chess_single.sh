#!/bin/bash
# The single-agent setting of the chess task: ONE Claude Code session following program.chess.md, no supervisor and no
# time limit. The session starts with ops/chess_single_prompt.txt, and a native Stop hook (ops/chess_keep_going.sh) gives
# that same prompt again whenever the agent tries to stop before the 200 rated games are played. If the process itself ends early (a crash or a usage limit), run this again: it
# resumes the same session.
#   bash ops/run_chess_single.sh MODEL LADDER        (LADDER: opus | haiku, see ops/chess_ladder.sh)
set -uo pipefail
cd "$(dirname "$0")/.."
MODEL="${1:?usage: run_chess_single.sh MODEL}"
export EAT_TASK=chess
source ops/env.sh
bash ops/chess_ladder.sh "${2:?usage: run_chess_single.sh MODEL LADDER}" || exit 1
ROOT="$(pwd)"
LOG=agent_team/single; mkdir -p "$LOG"
[ -f "$LOG/session_id" ] || python3 -c "import uuid; print(uuid.uuid4())" > "$LOG/session_id"
SID="$(< "$LOG/session_id")"
MEMORY_DIR="$EAT_WORK/claude_memory"; mkdir -p "$MEMORY_DIR"   # this run's own Claude Code memory, not shared with other checkouts
SETTINGS=$(python3 -c "import json,sys; print(json.dumps({'autoMemoryDirectory': sys.argv[1], 'hooks': {'Stop': [{'hooks': [{'type': 'command', 'command': sys.argv[2]}]}]}}))" "$MEMORY_DIR" "$ROOT/ops/chess_keep_going.sh")
ARGS=(--print --model "$MODEL" --dangerously-skip-permissions --output-format json --disallowedTools "WebSearch,WebFetch" --settings "$SETTINGS")
n=$(ls "$LOG"/call_*.json 2>/dev/null | wc -l); n=$((n + 1))
echo "[single] $(date -u +%H:%M:%SZ) call $n, session $SID: $("$EAT_VENV/bin/python" tools/chess_arena.py status | head -1)"
if compgen -G "$HOME/.claude/projects/*/$SID.jsonl" > /dev/null; then
    claude "${ARGS[@]}" --resume "$SID" < ops/chess_single_prompt.txt > "$LOG/call_$n.json" 2>> "$LOG/stderr.log"
else
    claude "${ARGS[@]}" --session-id "$SID" < ops/chess_single_prompt.txt > "$LOG/call_$n.json" 2>> "$LOG/stderr.log"
fi
echo "[single] $(date -u +%H:%M:%SZ) session ended: $("$EAT_VENV/bin/python" tools/chess_arena.py status | head -1)"
"$EAT_VENV/bin/python" tools/eval_chess.py --done || echo "[single] not finished: run the same command to resume the session."

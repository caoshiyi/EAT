#!/bin/bash
# Claude Code Stop hook for the single-agent chess run: while rated games remain, block the stop and give the agent its
# initial prompt again (agent_team/single/prompt.txt, the same text run_chess_single.sh starts the session with). Allows the stop once all 200 rated games are played, or after
# three stops in a row with no new move in the ledger (so a session that cannot make progress is not looped forever).
cd "$(dirname "$0")/.."
cat > /dev/null                                  # the hook's JSON input is not needed
"${EAT_VENV:-.work/venv}/bin/python" tools/eval_chess.py --done && exit 0
STATE=agent_team/single/.stop_state
lines=0; [ -f tasks/chess/arena/ledger.jsonl ] && lines=$(wc -l < tasks/chess/arena/ledger.jsonl)
last=-1; idle=0; [ -f "$STATE" ] && read -r last idle < "$STATE"
if [ "$lines" = "$last" ]; then idle=$((idle + 1)); else idle=0; fi
mkdir -p agent_team/single; echo "$lines $idle" > "$STATE"
echo "$(date -u +%H:%M:%SZ) stop hook: ledger lines $lines, idle $idle" >> agent_team/single/hook.log
[ "$idle" -ge 3 ] && exit 0
P=agent_team/single/prompt.txt; [ -f "$P" ] || P=ops/chess_single_prompt.txt
python3 -c "import json,sys; print(json.dumps({'decision': 'block', 'reason': open(sys.argv[1]).read().strip()}))" "$P"

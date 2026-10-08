#!/bin/bash
# Keep a long persistent-supervisor run affordable: when one supervisor turn (incl. retries) of the current session costs more
# than LIMIT dollars, let that iteration's team finish and commit, then stop the loop and relaunch at the next iteration with a
# fresh supervisor session. Stops for good when the loop reports its budget exhausted or the experiment complete.
# Usage: ops/rotate_supervisor.sh BUDGET [LIMIT=25] [MAX_ITERS=80] [TEAM_SIZE=3]
# Expects the run to be started in tmux session "$EAT_SESSION<start_iter>" with output tee'd to $EAT_LOG, i.e.
#   tmux new-session -d -s ${EAT_SESSION}1 "bash agent_team/launch_stateless.sh --persistent $EAT_TASK 80 3 BUDGET 1 2>&1 | tee -a $EAT_LOG"
set -u
source "$(dirname "$0")/env.sh"
BUDGET=$1
LIMIT=${2:-25}
MAX_ITERS=${3:-80}
TEAM_SIZE=${4:-3}
REQ=agent_team/requirements/$EAT_TASK.md
descendants() { local c; for c in $(pgrep -P "$1"); do echo "$c"; descendants "$c"; done; }
since() { sed -n "/start iter $1\$/,\$p" "$EAT_LOG"; }
cd "$EAT_ROOT"
while true; do
    START=$(grep -oE "start iter [0-9]+$" "$EAT_LOG" | tail -1 | grep -oE "[0-9]+")
    while true; do
        since "$START" | grep -q "budget exhausted" && { echo "$(date) budget exhausted; done"; exit 0; }
        N=$(python3 - "$START" "$LIMIT" <<'EOF'
import sys
start, limit = int(sys.argv[1]), float(sys.argv[2])
tot = {}
for l in open("agent_team/BUDGET.md"):
    c = [x.strip() for x in l.split("|")[1:-1]]
    if len(c) >= 3 and c[0].isdigit() and c[1].startswith("supervisor") and int(c[0]) >= start:
        tot[int(c[0])] = tot.get(int(c[0]), 0) + float(c[2])
over = sorted(i for i, v in tot.items() if v > limit)
print(over[0] if over else "")
EOF
)
        [ -n "$N" ] && break
        sleep 30
    done
    echo "$(date) iteration $N supervisor turn > \$$LIMIT; rotating after it completes"
    until since "$START" | grep -qE "\[team\] Iteration $N complete|budget exhausted|SUPERVISOR EXPERIMENT COMPLETE"; do sleep 1; done
    since "$START" | grep -qE "budget exhausted|SUPERVISOR EXPERIMENT COMPLETE" && { echo "$(date) run ended; done"; exit 0; }
    SESSION=$EAT_SESSION$START
    PANE=$(tmux list-panes -t "$SESSION" -F "#{pane_pid}" | head -1)
    ALL="$PANE $(descendants "$PANE")"
    kill -TERM $ALL 2>/dev/null; sleep 3; kill -KILL $ALL 2>/dev/null
    tmux kill-session -t "$SESSION" 2>/dev/null
    NEXT=$((N + 1))
    cat >> "$REQ" <<EOF

## Operator note for iteration $NEXT (fresh supervisor session)

The previous supervisor session was replaced because its turns had grown above \$$LIMIT. Nothing else changed: the briefings
above (state, goal, rules, budget \$$BUDGET) still apply. Read the latest notes and results before planning.
EOF
    git add "$REQ"
    git commit -qm "$EAT_TASK: fresh supervisor from iteration $NEXT (previous supervisor turn > \$$LIMIT)"
    echo "=== restart $(date): budget $BUDGET, fresh supervisor session (supervisor turn > \$$LIMIT), start iter $NEXT" >> "$EAT_LOG"
    tmux new-session -d -s "$EAT_SESSION$NEXT" "cd $EAT_ROOT && unset RESUME_SESSION_ID && bash agent_team/launch_stateless.sh --persistent $EAT_TASK $MAX_ITERS $TEAM_SIZE $BUDGET $NEXT 2>&1 | tee -a $EAT_LOG"
    echo "$(date) restarted at iteration $NEXT"
done

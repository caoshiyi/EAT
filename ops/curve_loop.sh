#!/bin/bash
# Every 5 min export $EAT_WORK/curve_auto.json; when an iteration closes with a new-best harness score, verify it on an idle GPU.
# Exits once the run's tmux session is gone.  Usage: ops/curve_loop.sh [LAST_DONE_ITER] [BEST_SCORE]
source "$(dirname "$0")/env.sh"
OUT=$EAT_WORK/curve_auto.json
DONE=${1:-0}
BEST=${2:-0}
while true; do
    python3 "$EAT_ROOT/ops/curve_data.py" > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
    for row in $(python3 -c "import json;[print(f\"{i['n']}:{i['score']}\") for i in json.load(open('$OUT'))['iters'] if i['end'] and i['n'] > $DONE]"); do
        n=${row%%:*}; s=${row##*:}
        echo "$(date '+%F %T') iteration $n closed, harness $s"
        if python3 -c "import sys; sys.exit(0 if float('$s') > $BEST else 1)" 2>/dev/null; then
            python3 "$EAT_ROOT/ops/verify_iter.py" "$n"
            BEST=$s
        fi
        DONE=$n
        python3 "$EAT_ROOT/ops/curve_data.py" > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
    done
    tmux ls 2>/dev/null | grep -q "^$EAT_SESSION" || { echo "$(date '+%F %T') run finished"; exit 0; }
    sleep 300
done

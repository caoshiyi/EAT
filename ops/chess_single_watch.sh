#!/bin/bash
# Keeps a single-agent chess run going unattended. run_chess_single.sh ends when its claude process ends, which a usage
# limit or a crash can cause before the 200 rated games are played; this waits 5 minutes after that and runs the same
# command again in the run's tmux window (it resumes the same session). Read-only otherwise; stops once the run is done.
#   setsid nohup bash ops/chess_single_watch.sh RUN_DIR TMUX_WINDOW MODEL LADDER > RUN_DIR/.work/watch.log 2>&1 &
RUN="${1:?run dir}"; WIN="${2:?tmux window}"; MODEL="${3:?model}"; LADDER="${4:?ladder}"
cd "$RUN" || exit 1
log() { echo "[watch] $(date -u +%H:%M:%SZ) $*"; }
n=0
log "watching $RUN in $WIN"
until .work/venv/bin/python tools/eval_chess.py --done > /dev/null 2>&1; do
    pane=$(tmux list-panes -t "$WIN" -F '#{pane_pid}' 2>/dev/null | head -1)   # list-panes fails on a missing window; display falls back to another pane
    [ -n "$pane" ] || { log "tmux window $WIN is gone; stopping"; exit 1; }
    if ps -o args= --ppid "$pane" | grep -q "run_chess_single.sh"; then sleep "${WATCH_POLL:-60}"; continue; fi
    [ "$n" -ge 200 ] && { log "gave up after $n restarts"; exit 1; }
    log "run is not running and not finished ($(.work/venv/bin/python tools/chess_arena.py status | head -1)); restart in 5 min"
    sleep "${WATCH_WAIT:-300}"
    ps -o args= --ppid "$pane" | grep -q "run_chess_single.sh" && continue
    n=$((n + 1)); log "restart $n"
    tmux send-keys -t "$WIN" "cd $RUN && bash ops/run_chess_single.sh $MODEL $LADDER 2>&1 | tee -a .work/run.log" Enter
    sleep "${WATCH_SETTLE:-120}"
done
log "run finished; stopping"

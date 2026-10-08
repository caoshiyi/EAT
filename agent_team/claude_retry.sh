#!/bin/bash
# One `claude --print` call that does not give up when the account does: a call that fails on a usage or rate limit,
# an overload, or a login problem waits and tries again, for as long as it takes (log in to another account with
# `claude /login` and the next try uses it). Any other failure is tried CLAUDE_RETRY_ERRORS times, then reported.
#
# Usage: claude_retry.sh PROMPT_FILE OUT_JSON STDERR_LOG RESTARTED(0|1) -- <claude arguments>
#   RESTARTED=1: the same prompt was launched before and interrupted; a short note says so ahead of the prompt.
# Environment: CR_SESSION_ID (a persistent session: resumed if its transcript exists, else created with that id),
#   CR_NO_NOTE=1 (never add the note: the supervisor's turns), CLAUDE_RETRY_WAIT (seconds between tries after a limit, default 300), CLAUDE_RETRY_ERRORS (default 3).
set -uo pipefail
PROMPT_FILE="$1"; OUT="$2"; ERRLOG="$3"; RESTARTED="$4"; shift 5
HERE="$(cd "$(dirname "$0")" && pwd)"
WAIT="${CLAUDE_RETRY_WAIT:-300}"
MAX_ERRORS="${CLAUDE_RETRY_ERRORS:-3}"
NOTE="NOTE FROM THE LAUNCHER: this exact assignment was started before and was interrupted (the work was not lost: everything already done is on disk). First find out what is already done, then do only what remains of the assignment below; anything it asks for in total includes what is already done.

"
errors=0
while :; do
    SESSION_ARGS=()
    if [ -n "${CR_SESSION_ID:-}" ]; then
        if compgen -G "$HOME/.claude/projects/*/${CR_SESSION_ID}.jsonl" > /dev/null; then
            SESSION_ARGS=(--resume "$CR_SESSION_ID")
        else
            SESSION_ARGS=(--session-id "$CR_SESSION_ID")
        fi
    fi
    if [ "$RESTARTED" = "1" ]; then
        { printf '%s' "$NOTE"; cat "$PROMPT_FILE"; } | claude --print "$@" "${SESSION_ARGS[@]}" > "$OUT.try" 2> "$OUT.err"
    else
        claude --print "$@" "${SESSION_ARGS[@]}" < "$PROMPT_FILE" > "$OUT.try" 2> "$OUT.err"
    fi
    rc=$?
    cat "$OUT.err" >> "$ERRLOG"
    status=$(python3 "$HERE/call_status.py" "$OUT.try" "$OUT.err" "$rc")
    if [ "$status" = "ok" ]; then
        mv "$OUT.try" "$OUT"; rm -f "$OUT.err"
        exit 0
    fi
    [ "${CR_NO_NOTE:-0}" = "1" ] || RESTARTED=1
    if [ "$status" = "limit" ]; then
        echo "[claude_retry] $(date -u +%H:%M:%SZ) $(basename "$OUT"): usage limit, overload or login problem (exit $rc). Trying again in ${WAIT}s; to continue on another account, run 'claude /login'." >&2
        sleep "$WAIT"
        continue
    fi
    errors=$((errors + 1))
    echo "[claude_retry] $(date -u +%H:%M:%SZ) $(basename "$OUT"): call failed (exit $rc), try $errors of $MAX_ERRORS." >&2
    if [ "$errors" -ge "$MAX_ERRORS" ]; then
        mv "$OUT.try" "$OUT"; rm -f "$OUT.err"
        exit 1
    fi
    sleep 30
done

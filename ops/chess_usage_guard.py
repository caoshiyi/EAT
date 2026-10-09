#!/usr/bin/env python3
"""Pause chess runs when the Claude subscription's 5-hour window gets high, and resume them after it resets, so that
other work on the same subscription keeps room.

    setsid nohup python3 ops/chess_usage_guard.py --threshold 80 \
        --run RUN_DIR=TMUX_WINDOW="RESUME COMMAND" ... > guard.log 2>&1 &

Every --poll seconds it reads the 5-hour utilization (the endpoint Claude Code's own usage view uses, with the login
in ~/.claude/.credentials.json). At or above --threshold it pauses every run: it writes RUN_DIR/.work/PAUSED (which
ops/chess_single_watch.sh respects) and stops every process of the run's tmux window, except the window's shell. Once
the window has reset (now past the resets_at seen when pausing, and utilization below the threshold) it removes the
PAUSED files and types each run's resume command into its window (the run commands continue where they stopped).
"""
import argparse
import datetime as dt
import json
import os
import signal
import subprocess
import time
import urllib.request
from pathlib import Path

STATE = Path.home() / "EAT" / ".work" / "chess_usage_guard.json"


def log(msg):
    print(f"[guard] {dt.datetime.now(dt.timezone.utc):%H:%M:%SZ} {msg}", flush=True)


def five_hour():
    """(utilization percent, resets_at datetime) or None if the meter cannot be read now."""
    try:
        tok = json.load(open(Path.home() / ".claude" / ".credentials.json"))["claudeAiOauth"]["accessToken"]
        req = urllib.request.Request("https://api.anthropic.com/api/oauth/usage", headers={
            "Authorization": "Bearer " + tok, "anthropic-beta": "oauth-2025-04-20", "Content-Type": "application/json"})
        d = json.load(urllib.request.urlopen(req, timeout=30))["five_hour"]
        # right after a reset the window has no resets_at until something is used in it: it is empty, not unknown
        resets = dt.datetime.fromisoformat(d["resets_at"]) if d.get("resets_at") else dt.datetime.now(dt.timezone.utc)
        return float(d["utilization"] or 0), resets
    except Exception as e:     # a failed read is skipped; the next poll tries again
        log(f"usage read failed: {type(e).__name__}: {e}")
        return None


def procs():
    """pid -> (ppid, session id) for every process."""
    out = {}
    for p in os.listdir("/proc"):
        if p.isdigit():
            try:
                f = open(f"/proc/{p}/stat").read().rsplit(")", 1)[1].split()
                out[int(p)] = (int(f[1]), int(f[3]))
            except (OSError, IndexError, ValueError):
                pass
    return out


def window_procs(shell):
    """Every process started from the window's shell: its descendants, anything still in the shell's session (forks
    whose parent already died), and the sessions those started with setsid (agents under a deadline)."""
    ps = procs()
    kids = {}
    for pid, (ppid, _) in ps.items():
        kids.setdefault(ppid, []).append(pid)
    found, todo = set(), [shell]
    while todo:
        for c in kids.get(todo.pop(), []):
            if c not in found:
                found.add(c); todo.append(c)
    found |= {pid for pid, (_, sid) in ps.items() if sid == shell}
    sids = {ps[p][1] for p in found if p in ps} - {shell}
    found |= {pid for pid, (_, sid) in ps.items() if sid in sids}
    found.discard(shell); found.discard(os.getpid())
    return found


def pane_shell(window):
    r = subprocess.run(["tmux", "list-panes", "-t", window, "-F", "#{pane_pid}"], capture_output=True, text=True)
    return int(r.stdout.split()[0]) if r.returncode == 0 and r.stdout.split() else None


def pause(run, window):
    (Path(run) / ".work" / "PAUSED").write_text(f"paused by chess_usage_guard.py at {dt.datetime.now(dt.timezone.utc).isoformat()}\n")
    shell = pane_shell(window)
    if shell is None:
        log(f"{window}: no such tmux window"); return
    for rnd in range(5):                      # repeat: a launcher may fork between the listing and the kill
        ps = window_procs(shell)
        if not ps:
            break
        for p in ps:
            try:
                os.kill(p, signal.SIGTERM)
            except ProcessLookupError:
                pass
        time.sleep(3)
    left = window_procs(shell)
    for p in left:
        try:
            os.kill(p, signal.SIGKILL)
        except ProcessLookupError:
            pass
    log(f"paused {run} ({window}); {len(left)} process(es) needed SIGKILL")


def resume(run, window, cmd):
    (Path(run) / ".work" / "PAUSED").unlink(missing_ok=True)
    if cmd:
        subprocess.run(["tmux", "send-keys", "-t", window, f"cd {run} && {cmd}", "Enter"])
    log(f"resumed {run} ({window})" + ("" if cmd else " (its watcher restarts it)"))


def main():
    a = argparse.ArgumentParser()
    a.add_argument("--threshold", type=float, default=80)
    a.add_argument("--poll", type=int, default=300)
    a.add_argument("--run", action="append", required=True, help='RUN_DIR=TMUX_WINDOW=RESUME_COMMAND (empty command: '
                   'a watcher restarts the run once PAUSED is gone)')
    a = a.parse_args()
    runs = [r.split("=", 2) for r in a.run]
    state = json.loads(STATE.read_text()) if STATE.exists() else {"paused": False}
    log(f"threshold {a.threshold:g}%, poll {a.poll}s, runs: {[r[0] for r in runs]}, state {state}")
    while True:
        u = five_hour()
        if u:
            util, resets = u
            if not state["paused"] and util >= a.threshold:
                log(f"5-hour window at {util:g}% (>= {a.threshold:g}%), resets {resets:%H:%M}Z: pausing")
                for run, win, _ in runs:
                    pause(run, win)
                state = {"paused": True, "resets_at": resets.isoformat()}
                STATE.write_text(json.dumps(state))
            elif state["paused"] and dt.datetime.now(dt.timezone.utc) > dt.datetime.fromisoformat(state["resets_at"]) \
                    and util < a.threshold:
                log(f"window reset (now {util:g}%): resuming")
                for run, win, cmd in runs:
                    resume(run, win, cmd)
                state = {"paused": False}
                STATE.write_text(json.dumps(state))
            else:
                log(f"5-hour {util:g}%, resets {resets:%H:%M}Z, {'paused' if state['paused'] else 'running'}")
        time.sleep(a.poll)


if __name__ == "__main__":
    main()

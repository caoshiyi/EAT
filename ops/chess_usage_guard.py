#!/usr/bin/env python3
"""Pause chess runs when the Claude subscription's 5-hour window gets high, and resume them after it resets, so that
other work on the same subscription keeps room.

    setsid nohup python3 ops/chess_usage_guard.py --threshold 80 \
        --run RUN_DIR=TMUX_WINDOW="RESUME COMMAND" ... > guard.log 2>&1 &

Every --poll seconds it reads the 5-hour utilization (the endpoint Claude Code's own usage view uses, with the login
in $CLAUDE_CONFIG_DIR/.credentials.json, default ~/.claude: run one guard per account, each with its own --state). At or above --threshold it pauses every run: it writes RUN_DIR/.work/PAUSED (which
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

CONFIG = Path(os.environ.get("CLAUDE_CONFIG_DIR", Path.home() / ".claude"))   # the account whose meter is read
STATE = Path.home() / "EAT" / ".work" / "chess_usage_guard.json"


def log(msg):
    print(f"[guard] {dt.datetime.now(dt.timezone.utc):%H:%M:%SZ} {msg}", flush=True)


def meter():
    """The account's meter, or None if it cannot be read now: {"five": (percent, resets_at), "week": (percent, resets_at),
    "extra_used": paid extra-usage credits used this month (None if the account has no extra usage)}."""
    try:
        tok = json.load(open(CONFIG / ".credentials.json"))["claudeAiOauth"]["accessToken"]
        req = urllib.request.Request("https://api.anthropic.com/api/oauth/usage", headers={
            "Authorization": "Bearer " + tok, "anthropic-beta": "oauth-2025-04-20", "Content-Type": "application/json"})
        d = json.load(urllib.request.urlopen(req, timeout=30))
        now = dt.datetime.now(dt.timezone.utc)

        def window(w):   # right after a reset a window has no resets_at until something is used in it: empty, not unknown
            w = w or {}
            return float(w.get("utilization") or 0), dt.datetime.fromisoformat(w["resets_at"]) if w.get("resets_at") else now
        extra = d.get("extra_usage") or {}
        return {"five": window(d.get("five_hour")), "week": window(d.get("seven_day")),
                "extra_used": float(extra["used_credits"]) if extra.get("is_enabled") and extra.get("used_credits") is not None else None}
    except Exception as e:     # a failed read is skipped; the next poll tries again
        log(f"usage read failed: {type(e).__name__}: {e}")
        return None


LAST = {"five": None}   # the last 5-hour percent read, for the token refresh below


def keep_login_fresh():
    """While an account's runs are paused nothing uses its login, so its OAuth token can expire (8 h) and the meter
    becomes unreadable. Claude Code refreshes a token only when it makes a call: when the token is within 20 minutes
    of expiring, make one tiny Haiku call with that account (never when its 5-hour window is at 95% or more, so it
    cannot spend paid extra usage)."""
    try:
        exp = json.load(open(CONFIG / ".credentials.json"))["claudeAiOauth"].get("expiresAt", 0) / 1000
    except (OSError, ValueError, KeyError):
        return
    if exp - time.time() > 20 * 60:
        return
    if LAST["five"] is not None and LAST["five"] >= 95:
        log(f"login token expires soon, but the 5-hour window is at {LAST['five']:g}%: not refreshing"); return
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    env["CLAUDE_CONFIG_DIR"] = str(CONFIG)
    scratch = Path(os.environ.get("TMPDIR", "/tmp")) / "chess_guard_refresh"; scratch.mkdir(exist_ok=True)
    r = subprocess.run(["claude", "-p", "--model", "haiku", "Reply OK."], cwd=scratch, env=env,
                       capture_output=True, text=True, timeout=180)
    try:
        new = json.load(open(CONFIG / ".credentials.json"))["claudeAiOauth"].get("expiresAt", 0) / 1000
    except (OSError, ValueError, KeyError):
        new = 0
    log("login token refreshed" if new > exp else f"login token refresh failed: {(r.stdout or r.stderr).strip()[:160]}")


def five_hour():
    m = meter()
    return m and m["five"]


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
    # a run with a game clock: no agent can move now, so the clock stops (the run's launcher restarts it)
    subprocess.run([str(Path(run) / ".work" / "venv" / "bin" / "python"), "tools/chess_arena.py", "clock", "pause"], cwd=run,
                   env=dict(os.environ, CHESS_HARNESS="1"), capture_output=True)
    log(f"paused {run} ({window}); {len(left)} process(es) needed SIGKILL")


def resume(run, window, cmd):
    (Path(run) / ".work" / "PAUSED").unlink(missing_ok=True)
    if cmd:
        subprocess.run(["tmux", "send-keys", "-t", window, f"cd {run} && {cmd}", "Enter"])
    log(f"resumed {run} ({window})" + ("" if cmd else " (its watcher restarts it)"))


def main():
    a = argparse.ArgumentParser()
    a.add_argument("--threshold", type=float, default=80, help="pause at this 5-hour percent, until the window resets")
    a.add_argument("--weekly-threshold", type=float, help="also pause at this weekly percent, until the week resets")
    a.add_argument("--no-extra", action="store_true", help="pause, and stay paused until a person resumes, as soon as any "
                   "paid extra-usage credit is used (accounts with extra usage turned on)")
    a.add_argument("--poll", type=int, default=300)
    a.add_argument("--state", default=str(STATE), help="state file; one per guard when several accounts each have a guard")
    a.add_argument("--run", action="append", required=True, help='RUN_DIR=TMUX_WINDOW=RESUME_COMMAND (empty command: '
                   'a watcher restarts the run once PAUSED is gone)')
    a = a.parse_args()
    runs = [r.split("=", 2) for r in a.run]
    state_file = Path(a.state)
    state = json.loads(state_file.read_text()) if state_file.exists() else {"paused": False}
    log(f"threshold {a.threshold:g}% (5-hour)" + (f", {a.weekly_threshold:g}% (weekly)" if a.weekly_threshold else "")
        + (", no extra usage" if a.no_extra else "") + f", poll {a.poll}s, runs: {[r[0] for r in runs]}, state {state}")
    while True:
        keep_login_fresh()
        m = meter()
        if m:
            (f_pct, f_reset), (w_pct, w_reset), extra = m["five"], m["week"], m["extra_used"]
            LAST["five"] = f_pct
            if a.no_extra and extra is not None and "extra_base" not in state:
                state["extra_base"] = extra           # credits already used before this guard started are not ours
                state_file.write_text(json.dumps(state))
            blocks = []                               # (why, until when)
            if f_pct >= a.threshold:
                blocks.append((f"5-hour window at {f_pct:g}% (>= {a.threshold:g}%)", f_reset))
            if a.weekly_threshold and w_pct >= a.weekly_threshold:
                blocks.append((f"weekly at {w_pct:g}% (>= {a.weekly_threshold:g}%)", w_reset))
            spent = a.no_extra and extra is not None and extra > state.get("extra_base", 0) + 1e-9
            if spent:
                blocks.append((f"extra-usage credits used: {extra:g} (was {state.get('extra_base', 0):g})", None))
            line = f"5-hour {f_pct:g}% (resets {f_reset:%H:%M}Z), weekly {w_pct:g}%" + (f", extra used {extra:g}" if extra is not None else "")
            if not state["paused"] and blocks:
                log(line + " -> pausing: " + "; ".join(w for w, _ in blocks))
                for run, win, _ in runs:
                    pause(run, win)
                until = [u for _, u in blocks if u]
                state.update(paused=True, resets_at=max(until).isoformat() if until else None, locked=bool(spent))
                state_file.write_text(json.dumps(state))
            elif state["paused"] and spent and not state.get("locked"):
                state["locked"] = True                # extra usage while paused: never resume on our own
                state_file.write_text(json.dumps(state))
                log(line + " -> extra usage used: stays paused until a person resumes")
            elif state["paused"] and not state.get("locked") and not blocks and \
                    dt.datetime.now(dt.timezone.utc) > dt.datetime.fromisoformat(state["resets_at"]):
                log(line + " -> limits clear: resuming")
                for run, win, cmd in runs:
                    resume(run, win, cmd)
                state.update(paused=False, resets_at=None, locked=False)
                state_file.write_text(json.dumps(state))
            else:
                log(line + (", PAUSED until a person resumes (extra usage)" if state.get("locked")
                            else ", paused" if state["paused"] else ", running"))
        time.sleep(a.poll)


if __name__ == "__main__":
    main()

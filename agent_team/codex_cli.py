#!/usr/bin/env python3
"""`claude --print` stand-in that runs OpenAI Codex (`codex exec`), so the harness can drive Codex agents unchanged.

    EAT_AGENT_CLI=agent_team/codex_cli.py   (claude_retry.sh calls it with the same arguments it gives claude)

Translates the claude arguments the harness uses and nothing else:
  --print                          ignored (codex exec is always non-interactive)
  --model M                        -m M
  --dangerously-skip-permissions   --dangerously-bypass-approvals-and-sandbox, unless writing is denied (below)
  --output-format json             always: one claude-style result object on stdout
  --disallowedTools LIST           Write/Edit in LIST -> read-only sandbox (the supervisor); WebSearch/WebFetch in LIST
                                   -> web search and browser tools off; other names have no Codex counterpart
  --settings JSON                  ignored (Claude Code settings)
  --session-id ID / --resume ID    one persistent conversation per ID: resumed if this ID has a Codex thread
Codex reads CLAUDE.md as its project instructions, as claude does. CODEX_EFFORT sets the reasoning effort. The prompt comes on stdin, as for claude. Cost is estimated from token counts and the CODEX_PRICE_* environment
($ per million tokens; unset prices count as 0), since a ChatGPT-plan login is not billed per call.
"""
import json
import os
import pathlib
import signal
import subprocess
import sys

CODEX = os.environ.get("CODEX_BIN", "codex")
SESSIONS = pathlib.Path(os.environ.get("CODEX_SESSION_MAP", pathlib.Path.home() / ".codex" / "eat_sessions"))


def parse(argv):
    a = {"model": None, "session": None, "deny": set(), "bypass": False}
    i = 0
    while i < len(argv):
        x = argv[i]
        if x in ("--model", "--session-id", "--resume", "--disallowedTools", "--settings", "--output-format"):
            v = argv[i + 1]
            if x == "--model":
                a["model"] = v
            elif x in ("--session-id", "--resume"):
                a["session"] = v
            elif x == "--disallowedTools":
                a["deny"] |= {t.strip() for t in v.split(",") if t.strip()}
            i += 2
            continue
        if x == "--dangerously-skip-permissions":
            a["bypass"] = True
        i += 1
    return a


def thread_of(session):
    p = SESSIONS / session if session else None
    return p.read_text().strip() if p and p.exists() else None


def main():
    a = parse(sys.argv[1:])
    prompt = sys.stdin.read()
    flags = ["--json", "--skip-git-repo-check", "-c", 'project_doc_fallback_filenames=["CLAUDE.md"]']   # same project notes as claude
    if a["model"]:
        flags += ["-m", a["model"]]
    if os.environ.get("CODEX_EFFORT"):   # reasoning effort (low | medium | high | xhigh); unset = the model's default
        flags += ["-c", f'model_reasoning_effort="{os.environ["CODEX_EFFORT"]}"']
    if {"Write", "Edit"} & a["deny"]:
        flags += ["-c", 'sandbox_mode="read-only"']   # resume has no --sandbox flag
    elif a["bypass"]:
        flags += ["--dangerously-bypass-approvals-and-sandbox"]
    if {"WebSearch", "WebFetch"} & a["deny"]:
        flags += ["-c", 'web_search="disabled"', "--disable", "browser_use", "--disable", "in_app_browser",
                  "--disable", "computer_use"]
    thread = thread_of(a["session"])
    cmd = [CODEX, "exec", "resume", *flags, thread, "-"] if thread else [CODEX, "exec", *flags, "-"]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    stopped = []
    # a stop (the team's time limit) still leaves a result: the agent's last message so far
    signal.signal(signal.SIGTERM, lambda *_: (stopped.append(1), p.terminate()))
    p.stdin.write(prompt)
    p.stdin.close()

    last, errors, usage, turns = "", [], {"input_tokens": 0, "cached_input_tokens": 0, "output_tokens": 0}, 0
    for line in p.stdout:
        try:
            e = json.loads(line)
        except ValueError:
            continue
        t = e.get("type")
        if t == "thread.started" and a["session"] and not thread:
            SESSIONS.mkdir(parents=True, exist_ok=True)
            (SESSIONS / a["session"]).write_text(e["thread_id"])
            thread = e["thread_id"]
        elif t == "item.completed" and (e.get("item") or {}).get("type") == "agent_message":
            last = e["item"].get("text", "")
        elif t == "turn.completed":
            turns += 1
            for k in usage:
                usage[k] += (e.get("usage") or {}).get(k, 0) or 0
        elif t in ("turn.failed", "error"):
            errors.append(str((e.get("error") or {}).get("message") or e.get("message") or e))
    p.wait()
    if stopped:
        errors.insert(0, "Stopped before finishing. Last message so far:\n" + (last or "(none)"))

    price = {k: float(os.environ.get(f"CODEX_PRICE_{k.upper()}", 0) or 0) for k in ("input", "cached", "output")}
    cost = ((usage["input_tokens"] - usage["cached_input_tokens"]) * price["input"]
            + usage["cached_input_tokens"] * price["cached"] + usage["output_tokens"] * price["output"]) / 1e6
    failed = bool(stopped) or p.returncode != 0 or (errors and not last)
    print(json.dumps({
        "type": "result", "subtype": "error" if failed else "success", "is_error": bool(failed),
        "result": ("\n".join(errors) or f"codex exited with {p.returncode}") if failed else last,
        "session_id": a["session"] or thread, "codex_thread_id": thread, "num_turns": turns,
        "total_cost_usd": round(cost, 4), "usage": usage}))
    return p.returncode if failed else 0


if __name__ == "__main__":
    sys.exit(main())

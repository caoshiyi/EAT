"""Leakage audit of a clean-room run's agent traces.

Scans every tool call in every transcript (supervisor, team agents, subagents) for:
  - web tools, network commands, package installs;
  - file paths outside the sandbox's allowed sources;
  - mentions of forbidden implementations (EAT_FORBIDDEN_RE, a regex);
  - reads of the eval's held-out / reference internals.
Prints a summary and writes every hit, with its transcript and line, to the report file.

Usage: python cleanroom/audit_clean_traces.py [REPORT]
Environment: EAT_CLEAN, EAT_TASK, EAT_ALLOWED_RO (as for sandbox.sh), EAT_FORBIDDEN_RE.
"""

import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

C = os.environ["EAT_CLEAN"]
TASK = os.environ["EAT_TASK"]
PROJ = Path(C) / "claude-config/projects" / re.sub(r"[^A-Za-z0-9]", "-", f"{C}/k-search-v2")
REPORT = Path(sys.argv[1] if len(sys.argv) > 1 else f"{C}/run/clean_trace_audit.txt")

ALLOWED_ROOTS = tuple(
    [C + "/k-search-v2", C + "/venv", C + "/home", C + "/tmp", C + "/run", C + "/bin"]
    + os.environ.get("EAT_ALLOWED_RO", "").split()
    + [os.environ.get("EAT_LOCKS", "/nonexistent"), "/usr", "/tmp", "/dev", "/proc", "/sys", "/etc", "/bin", "/lib",
       "/opt/nvidia", "/usr/local/cuda"]
)

NET = re.compile(r"\b(curl|wget|pip3?\s+(install|download)|uv\s+(pip|add)|conda\s+install|git\s+(clone|fetch|pull|"
                 r"remote\s+add|ls-remote)|apt(-get)?\s+install|huggingface-cli|nc\s|socat|ssh\s|scp\s)\b|"
                 r"https?://(?!127\.0\.0\.1|localhost)")
FORBIDDEN = re.compile(
    os.environ.get("EAT_FORBIDDEN_RE", r"(?!x)x")
    + rf"|k-search-v2/tasks/(?!{TASK})|claude-config/projects/(?!{PROJ.name})"
    + rf"|{re.escape(C)}/k-search-v2/\.git/(?!HEAD)|git\s+(log|show)\s+--all|reflog",
    re.I)
EVAL_INTERNAL = re.compile(rf"held[-_ ]?out|HELDOUT|SEED|eval_{TASK}\.py", re.I)
PATH = re.compile(r"(?<![\w.])/(?:ssd\d|home|root|data|mnt|opt|var|srv|scratch|nfs|raid|workspace)[^\s'\"`;|&)<>,]*")


def tool_calls(path):
    for i, line in enumerate(path.open(errors="replace"), 1):
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        msg = ev.get("message") or {}
        content = msg.get("content")
        if not isinstance(content, list):
            continue
        for part in content:
            if isinstance(part, dict) and part.get("type") == "tool_use":
                yield i, part.get("name", "?"), json.dumps(part.get("input", {}), ensure_ascii=False)


def main():
    files = sorted(PROJ.rglob("*.jsonl"))
    tools = Counter()
    hits = defaultdict(list)
    outside = Counter()
    for f in files:
        rel = f.relative_to(PROJ)
        for line, name, inp in tool_calls(f):
            tools[name] += 1
            where = f"{rel}:{line} [{name}]"
            if name in ("WebSearch", "WebFetch") or name.startswith("mcp__"):
                hits["web_tool"].append((where, inp[:300]))
            if NET.search(inp):
                hits["network_cmd"].append((where, inp[:300]))
            for m in FORBIDDEN.finditer(inp):
                hits["forbidden_ref"].append((where, inp[max(0, m.start() - 150):m.end() + 150]))
            if EVAL_INTERNAL.search(inp) and name in ("Read", "Grep", "Bash", "Glob"):
                hits["eval_internal"].append((where, inp[:300]))
            for p in PATH.findall(inp):
                if not p.startswith(ALLOWED_ROOTS):
                    outside[p[:120]] += 1
                    hits["outside_path"].append((where, p[:200]))
    with REPORT.open("w") as out:
        out.write(f"transcripts: {len(files)}\ntool calls: {sum(tools.values())} {dict(tools.most_common())}\n\n")
        for k in ("web_tool", "network_cmd", "forbidden_ref", "outside_path", "eval_internal"):
            out.write(f"== {k}: {len(hits[k])}\n")
            for where, s in hits[k]:
                out.write(f"{where}\n    {s}\n")
            out.write("\n")
    print(f"transcripts {len(files)}, tool calls {sum(tools.values())}: {dict(tools.most_common(8))}")
    for k in ("web_tool", "network_cmd", "forbidden_ref", "outside_path", "eval_internal"):
        print(f"{k}: {len(hits[k])}")
    print("outside paths:", outside.most_common(15))
    print("report:", REPORT)


if __name__ == "__main__":
    main()

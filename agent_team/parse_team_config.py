#!/usr/bin/env python3
"""Parse a supervisor TEAM_CONFIG into per-role prompt files and a phase plan.

Usage: parse_team_config.py <team_config> <iter_dir> <task> <max_team_size>

Writes <iter_dir>/<role>_prompt.txt and <iter_dir>/<role>_timeout (minutes, if given),
and prints the plan to stdout, one line per phase: comma-separated role names.

Role prompts are free-form markdown written by the supervisor and may themselves contain
headings such as "## Workflow", "## Success Criteria" or "Phase 1:", so sections are located
structurally: roles start at lines "### Role: <name>", the team-level Workflow / Success
Criteria sections are the LAST top-level headings of those names after the last role, and a
role's prompt runs from "**Prompt:**" to that role's LAST "**Working Directory:**" /
"**Timeout:**" field.
"""
import re
import sys
from pathlib import Path

cfg_path, iter_dir, task, max_team = sys.argv[1], Path(sys.argv[2]), sys.argv[3], int(sys.argv[4])
text = Path(cfg_path).read_text()
text = text.replace("---BEGIN TEAM_CONFIG---", "").replace("---END TEAM_CONFIG---", "")
lines = text.splitlines()

role_starts = [i for i, l in enumerate(lines) if re.match(r"^###\s*Role:\s*\S", l)]
fallback = (f"You are a GPU kernel optimizer working on the {task} task. "
            f"Read CLAUDE.md and tasks/{task}/program.md, then optimize the kernel.")


def clean_name(raw):
    name = re.sub(r"[`*]", "", raw).strip()
    name = re.split(r"\s+[\(\[—–-]\s*|\s*[\(\[]", name)[0].strip()
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", name) or "agent"


tail_start = len(lines)
if role_starts:
    after_roles = range(role_starts[-1] + 1, len(lines))
    wf_heads = [i for i in after_roles if re.match(r"^##\s*Workflow\s*$", lines[i], re.I)]
    sc_heads = [i for i in after_roles if re.match(r"^##\s*Success Criteria\s*$", lines[i], re.I)]
    if wf_heads:
        tail_start = wf_heads[-1]
    elif sc_heads:
        tail_start = sc_heads[-1]

roles = []
for k, s in enumerate(role_starts):
    e = role_starts[k + 1] if k + 1 < len(role_starts) else tail_start
    name = clean_name(re.sub(r"^###\s*Role:\s*", "", lines[s]))
    body = lines[s + 1:e]
    p0 = next((j for j, l in enumerate(body) if l.strip().startswith("**Prompt:**")), None)
    field_idx = [j for j, l in enumerate(body)
                 if re.match(r"^\s*\*\*(Working Directory|Timeout|Isolation):\*\*", l)]
    timeout = None
    for j in field_idx:
        m = re.match(r"^\s*\*\*Timeout:\*\*\s*(\d+)", body[j])
        if m:
            timeout = int(m.group(1))
    if p0 is None:
        prompt = ""
    else:
        first = body[p0].split("**Prompt:**", 1)[1]
        after = [j for j in field_idx if j > p0]
        # fields belong to the role only if nothing but fields/blank lines follow them
        cut = len(body)
        for j in sorted(after, reverse=True):
            if all(not l.strip() or re.match(r"^\s*\*\*(Working Directory|Timeout|Isolation):\*\*", l)
                   or l.strip() == "---" for l in body[j:cut]):
                cut = j
        prompt = "\n".join([first] + body[p0 + 1:cut]).strip()
    if name in [r[0] for r in roles]:
        name = f"{name}_{k + 1}"
    roles.append((name, prompt or fallback, timeout))

if not roles:
    roles = [("optimizer", fallback, None)]
if len(roles) > max_team:
    print(f"[parse] WARNING: {len(roles)} roles exceed max team size {max_team}; truncating",
          file=sys.stderr)
    roles = roles[:max_team]

for name, prompt, timeout in roles:
    (iter_dir / f"{name}_prompt.txt").write_text(prompt + "\n")
    if timeout:
        (iter_dir / f"{name}_timeout").write_text(str(timeout))

names = [r[0] for r in roles]
lookup = {n.lower(): n for n in names}
wf = "\n".join(lines[tail_start:])
m = re.search(r"^##\s*Workflow\s*$(.*?)(?=^##\s|\Z)", wf, re.S | re.M | re.I)
phases = []
if m:
    for pl in re.findall(r"^\s*[-*]\s*Phase\s*\d+\s*:\s*(.+)$", m.group(1), re.M | re.I):
        ph = []
        for r in re.split(r"[,;&]|\band\b", pl):
            key = clean_name(r).lower()
            if key in lookup and lookup[key] not in ph:
                ph.append(lookup[key])
            elif key:
                print(f"[parse] WARNING: phase references unknown role '{r.strip()}'", file=sys.stderr)
        if ph:
            phases.append(ph)
scheduled = {n for ph in phases for n in ph}
missing = [n for n in names if n not in scheduled]
if not phases:
    phases = [names]
elif missing:
    print(f"[parse] WARNING: roles not in any phase, appended as a final phase: {missing}",
          file=sys.stderr)
    phases.append(missing)

for ph in phases:
    print(",".join(ph))

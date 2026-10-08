"""Export a run's iterations >= FIRST (costs, harness scores, teams, ships) as JSON for plot_eat_curve.py.

Usage: python ops/curve_data.py [FIRST]   (reads EAT_ROOT, EAT_LOG, EAT_WORK from ops/env.sh)
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime

FIRST = int(sys.argv[1]) if len(sys.argv) > 1 else 1
REPO = os.environ["EAT_ROOT"]
LOG = os.environ["EAT_LOG"]
VERIFIED = os.path.join(os.environ["EAT_WORK"], "verified_auto.json")


def git_log():
    out = subprocess.run(["git", "-C", REPO, "log", "--format=%ci|%s"], capture_output=True, text=True).stdout
    rows = []
    for line in out.splitlines():
        ts, msg = line.split("|", 1)
        rows.append((datetime.strptime(ts[:19], "%Y-%m-%d %H:%M:%S").isoformat(), msg))
    return rows[::-1]


budget = {}
for line in open(f"{REPO}/agent_team/BUDGET.md"):
    m = re.match(r"\|\s*(\d+)\s*\|\s*(supervisor|team)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]*)\s*\|", line)
    if m and int(m.group(1)) >= FIRST:
        budget.setdefault(int(m.group(1)), {})[m.group(2)] = (float(m.group(4)), float(m.group(5)) if m.group(5) else None)

roles = dict(re.findall(r"Iteration (\d+) — launching \d+ agent\(s\): (.*)", open(LOG).read()))
log = git_log()
ends = {int(m.group(1)): ts for ts, msg in log if (m := re.match(r"iter (\d+): ", msg))}

iters = []
for n in sorted(set(budget) | {int(k) for k in roles if int(k) >= FIRST}):
    cfg = f"{REPO}/agent_team/iter_{n}/team_config.md"
    team_start = datetime.fromtimestamp(os.path.getmtime(cfg)).replace(microsecond=0).isoformat() if os.path.exists(cfg) else None
    b = budget.get(n, {})
    iters.append(dict(n=n, roles=roles.get(str(n), "").split(), team_start=team_start, end=ends.get(n),
                      sup_cum=b.get("supervisor", (None,))[0], team_cum=b.get("team", (None, None))[0],
                      score=b.get("team", (None, None))[1]))

ships = []
for ts, msg in log:
    m = re.search(r"build(\d+): ship (\S+)", msg)
    if m and int(m.group(1)) >= FIRST:
        pct = re.search(r"([+-]\d+(?:\.\d+)?) ?%", msg[m.end():])
        ships.append(dict(t=ts, n=int(m.group(1)), name=m.group(2).rstrip(",;:"), pct=float(pct.group(1)) if pct else None))

verified = json.load(open(VERIFIED)) if os.path.exists(VERIFIED) else []
now = datetime.now().replace(microsecond=0).isoformat()
print(json.dumps(dict(now=now, iters=iters, ships=ships, verified=verified), indent=1))

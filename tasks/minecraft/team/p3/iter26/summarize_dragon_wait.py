"""Read-only actual public wait trace summary. Never runs players or predicts reach."""
import argparse,json,math
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("record");a=p.parse_args()
f=Path(a.record).resolve();root=Path("tasks/minecraft/team").resolve()
if not f.is_relative_to(root):raise SystemExit("team records only")
samples=[]
for line in f.read_text().splitlines():
 if line.startswith("PUBLIC_DRAGON_WAIT "):
  samples.append(json.loads(line.split(" ",1)[1]))
rows=[dict(sample=i,**e) for i,s in enumerate(samples) for e in s]
report={"file":str(f.relative_to(root)),"samples":len(samples),"emptySamples":sum(not s for s in samples),"dragonObservations":len(rows),"note":"Only sampled public positions. Independent scalar minima must not be combined into a fictitious coordinate. No inferred phase, complete trajectory, dimensions, reach, future perch, damage or immunity."}
if rows:
 report.update(ids=sorted(set(r["id"] for r in rows)),minY=min(r["p"]["y"] for r in rows),maxY=max(r["p"]["y"] for r in rows),minXZ=min(math.hypot(r["p"]["x"],r["p"]["z"]) for r in rows),minYObservation=min(rows,key=lambda r:r["p"]["y"]),minXZObservation=min(rows,key=lambda r:math.hypot(r["p"]["x"],r["p"]["z"])),observedCallerCandidates=[r for r in rows if math.hypot(r["p"]["x"],r["p"]["z"])<5 and r["p"]["y"]<=65],first=rows[0],last=rows[-1])
print(json.dumps(report))

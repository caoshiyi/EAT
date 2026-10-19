"""Summarize public P2 shot receipts; absence is unknown, never success."""
import argparse,json,math
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('path');a=p.parse_args()
lines=Path(a.path).read_text().splitlines()
posts=[json.loads(x.split(' ',1)[1]) for x in lines if x.startswith('SURFACE_ACTUAL_POST ')]
shots=[json.loads(x.split(' ',1)[1]) for x in lines if x.startswith('ACTUAL_SURFACE_SHOT ')]
if not posts: raise SystemExit('UNKNOWN: no actual post receipt')
d=posts[-1];s=d['state'];out={'post_at':d['at'],'fired':d['fired'],'target_present':d['targetPresent'],'loaded_crystals':len(d['crystals']),'end_position':s['p'],'hp':s['hp'],'dimension':s['dim'],'snow':sum(q[1] for q in s['inv'] if q[0]=='snowball'),'failure_markers':[x for x in lines if x.startswith(('FAILURE','RECOVERY_FAILURE'))]}
if shots:
 sh=shots[-1];target=sh['target']['p'];pts=[];seen=set()
 for q in d['flight']:
  xyz=tuple(q['p'][c] for c in 'xyz')
  if xyz in seen:continue
  seen.add(xyz);r=math.hypot(xyz[0]-target['x'],xyz[2]-target['z']);pts.append({'p':q['p'],'horizontal_distance_to_target':r,'velocity':q['velocity']})
 out.update(shot=sh,nearest_recorded=sorted(pts,key=lambda q:q['horizontal_distance_to_target'])[:3],events=d['events'])
print(json.dumps(out,indent=2))

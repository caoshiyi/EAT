"""Build an observation ledger from LIVE p3 receipts. This is NOT the evaluator/score."""
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parent
paths=[Path(p) for p in sys.argv[1:]] if len(sys.argv)>1 else sorted(root.glob('*.txt'))
observations=[]
for p in paths:
 text=p.read_text()
 if '[sandbox] program' in text:continue
 meta=p.with_suffix('.json')
 if meta.exists():
  try:
   if json.loads(meta.read_text()).get('environment')=='sandbox':continue
  except ValueError:pass
 records=[]; fallback=None; own=None
 for line in text.splitlines():
  tag,_,raw=line.partition(' ')
  try:d=json.loads(raw)
  except ValueError:continue
  if tag in {'STATE','SOURCE','END'} and isinstance(d,dict):fallback=d.get('at',fallback);own=d.get('hp',own)
  records.append((tag,d))
 for tag,d in records:
  if tag in {'CHANGE','EFFECT'} and isinstance(d,dict) and isinstance(d.get('dragon'),dict):
   hp=d['dragon'].get('hp');at=d.get('at');p1=d.get('p1') or {};p3=d.get('p3') or {}
   observations.append((at,hp,p1.get('hp'),(p1.get('p') or {}).get('y'),d.get('ownHP',p3.get('hp')),p.name,tag))
  elif tag=='ENTITY_DIMENSIONS' and isinstance(d,dict):observations.append((fallback,d.get('hp'),None,None,own,p.name,tag))
  elif tag=='VELOCITY_OBSERVATIONS' and isinstance(d,list):
   for e in d:observations.append((e.get('at'),e.get('hp'),None,None,own,p.name,tag))
  elif tag=='CURRENT_DRAGON' and isinstance(d,list):
   for e in d:observations.append((fallback,e.get('hp'),None,None,own,p.name,tag))
observations=sorted((o for o in observations if o[0] and isinstance(o[1],(int,float))),key=lambda o:(o[0],o[5]))
print('observed_utc\tdragon_hp\tdamage_since_previous_observation\tp1_hp\tp1_y\tp3_hp\tsource\tkind')
last=None
for at,hp,p1,y,p3,source,kind in observations:
 if last is not None and abs(hp-last)<1e-6:continue
 delta='' if last is None else f'{last-hp:.6f}'
 vals=[at,f'{hp:.6f}',delta,p1,y,p3,source,kind]
 print('\t'.join('' if v is None else str(v) for v in vals));last=hp

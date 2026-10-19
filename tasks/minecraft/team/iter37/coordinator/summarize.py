"""Compact saved arena receipt inspection. Never invokes game actions."""
import json,re,sys
from pathlib import Path
for arg in sys.argv[1:]:
 s=Path(arg).read_text()
 for block in re.split(r'(?=^== #)',s,flags=re.M):
  if not block.startswith('== #'): continue
  print(block.splitlines()[0])
  if '-- output --' not in block: continue
  out=block.split('-- output --',1)[1]
  for line in out.splitlines():
   key=line.split(' ',1)[0]
   if key in ('RESULT','BATCH_SUMMARY','P1_SOURCE','SOURCE'):
    try: d=json.loads(line.split(' ',1)[1])
    except (ValueError,IndexError): continue
    if key=='SOURCE':
     print(key,json.dumps({k:d[k] for k in ('at','environment','player','dragon') if k in d}));continue
    wanted=('at','environment','player','attacks','hits','issue','initialBossHP','finalBossHP','ownHP','body','full','jumped','peak','dragonAfter','min','minRoot','phases','baitRoof52','baitEastGate')
    z={k:d[k] for k in wanted if k in d}
    if d.get('dragonBefore',{}).get('hp') is not None and d.get('dragonAfter',{}).get('hp') is not None: z['finalHealthDecrease']=d['dragonBefore']['hp']-d['dragonAfter']['hp']
    if 'state' in d: z['state']={k:d['state'][k] for k in ('at','p','hp','food') if k in d['state']}
    if 'faces' in d: z['full']=all(q.get('full') for q in d['faces'])
    print(key,json.dumps(z))
   elif key in ('FAIL','RETREATFAIL','TIMEDOUT','ERROR'): print(line[:1000])

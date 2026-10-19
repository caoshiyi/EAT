import json,sys
from pathlib import Path
for arg in sys.argv[1:]:
 p=Path(arg); rows=p.read_text().splitlines(); print(p.name)
 print(next((x for x in rows if x.startswith('program #')), 'no completion header'))
 for prefix in ('BATCH_SUMMARY ', 'RESULT '):
  matches=[x[len(prefix):] for x in rows if x.startswith(prefix)]
  if not matches: continue
  r=json.loads(matches[-1])
  if prefix.startswith('BATCH'): print(json.dumps(r)); continue
  print(json.dumps({k:r.get(k) for k in ('issue','attacks','dragonBefore','dragonAfter','min','minRoot','jumped','peak','repairs','baitRoof52','baitEastGate')}))
  print('full_boundary', all(x.get('full') for x in r.get('faces',[])), 'state', json.dumps(r.get('state',{})))

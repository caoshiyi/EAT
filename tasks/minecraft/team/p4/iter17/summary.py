import json,sys
from pathlib import Path
for name in sys.argv[1:]:
 s=Path(name).read_text(); print(name)
 try:
  d=json.loads(s.split('--- returned ---\n')[-1].split('\n--- chat')[0]); print(json.dumps({k:v for k,v in d.items() if k not in ('items','clouds','trace','samples','rows','entities','dragonHistory')},separators=(',',':')))
  for k in ('trace','samples','clouds'): 
   if k in d: print(k,'count='+str(len(d[k])),json.dumps(d[k][-20:],separators=(',',':')))
 except Exception: print(s[-2500:])

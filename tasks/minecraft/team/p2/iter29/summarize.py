#!/usr/bin/env python3
"""Summarize retained arena text, without inferring success from a clean exit."""
import json,pathlib,sys
for name in sys.argv[1:]:
 s=pathlib.Path(name).read_text(); rows=[]
 for l in s.splitlines():
  marker,sep,tail=l.partition(' ')
  if sep:
   try: data=json.loads(tail)
   except ValueError: continue
   rows.append((marker,data))
 ret=None
 try:ret=json.loads(s.split('--- returned ---\n',1)[1].split('\n--- ',1)[0])
 except (IndexError,ValueError):pass
 endings=[d for m,d in rows if m=='ENDING']
 out={'file':name,'header':next((l for l in s.splitlines() if 'program #' in l),None),'failures':[l for l in s.splitlines() if l.startswith(('FAILURE ','RECOVERY_FAILURE','ERROR '))],'returned':ret,'endings':len(endings),'last_full_faces':sum(bool(f.get('full')) for f in endings[-1].get('faces',[])) if endings else None,'post':[(m,d) for m,d in rows if m.endswith('_POST')],'actions':[(m,d) for m,d in rows if m in ['ORDINARY_CONTACT','ACTUAL_SURFACE_SHOT']],'best':[(m,d) for m,d in rows if m=='BEST_CONTACT'][-1:]}
 print(json.dumps(out,separators=(',',':')))

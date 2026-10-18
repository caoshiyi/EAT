import json,sys
from pathlib import Path
for arg in sys.argv[1:]:
 p=Path(arg);out=p.read_text();steps=[];term=None;audits=[]
 print(p.name)
 for line in out.splitlines():
  k,_,v=line.partition(' ')
  if k in ('FAIL','PRIMARY_FAILURE','RETENTION_FAILURE','CLOSE_FAIL','MODEL_NO_PATH'):print(line)
  try:d=json.loads(v)
  except (ValueError,TypeError):continue
  if k.endswith('STEP_ACTUAL') or k=='DOWN_ACTUAL':steps.append(d)
  if k=='FULL_AUDIT':audits.append(all(c.get('full') for c in d['cells']))
  if k=='TERMINAL':term=d
 if steps:print('steps',len(steps),'first',steps[0]['p'],'last',steps[-1]['p'])
 if term:
  s=term['state'];print('terminal', {k:s.get(k) for k in ['at','p','dim','hp','food','ground','controls','goal']},'full',sum(c.get('full',False) for c in term['shell']),'audits',audits)
 else:print('NO TERMINAL; inspect raw output and fresh world state')

"""Read-only arena full-record digest; raw records remain authoritative."""
import json,re,sys
from pathlib import Path
for name in sys.argv[1:]:
 text=Path(name).read_text()
 for block in re.split(r'(?=^== #)',text,flags=re.M):
  if not block.startswith('== #'):continue
  header=block.splitlines()[0]; body=block.split('-- output --\n',1)[-1] if '-- output --\n' in block else ''
  out={'record':header,'steps':0,'audits':[],'failures':[]}
  for line in body.splitlines():
   if line.startswith(('FAIL','PRIMARY_FAILURE','CLOSE_FAIL','RETENTION_FAILURE','CAP_REFUSAL','SNOW_HAND_RESULT')):out['failures'].append(line[:800])
   if line.startswith(('STEP_ACTUAL ','BRIDGED_STEP_ACTUAL ')):out['steps']+=1
   if line.startswith(('FULL_AUDIT ','TERMINAL ','ENDING ')):
    try:d=json.loads(line.split(' ',1)[1])
    except (ValueError,IndexError):continue
    s=d.get('state',d); cells=d.get('cells',d.get('shell',[]))
    a={k:s.get(k) for k in ['at','p','hp','food','dim','controls','goal'] if k in s}
    a['full']=sum(c.get('full') is True for c in cells);a['cells']=len(cells);a['gaps']=[c for c in cells if c.get('full') is not True]
    if line.startswith('TERMINAL '):out['terminal']=a
    else:out['audits'].append(a)
  if not body:out['note']='No output section; may be observation/chat/empty, not successful physical ending.'
  print(json.dumps(out))

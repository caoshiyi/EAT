"""Offline evidence gate for owner wrappers. Never invokes arena or controls a player.
Example: python3 .../verify_receipt.py FILE --program 14226 --marker PILOT_END --require issue=null --require escapeReady=true
Success verifies a printed receipt, not the live world or later survival.
"""
import argparse,json,re,sys
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('file');ap.add_argument('--program',required=True);ap.add_argument('--marker',required=True);ap.add_argument('--require',action='append',default=[]);a=ap.parse_args()
s=Path(a.file).read_text();blocks=re.split(r'(?=^== #)',s,flags=re.M)
if s.startswith('program #'+a.program+' '): block=s
else:
 matches=[b for b in blocks if b.startswith('== #'+a.program+' ')]
 if len(matches)!=1:sys.exit('FAIL: expected exactly one requested program')
 block=matches[0]
sep='-- output --' if '-- output --' in block else '--- output ---'
if sep not in block:sys.exit('FAIL: no actual output section')
out=block.split(sep,1)[1]; rows=[]
for l in out.splitlines():
 if l.startswith(a.marker+' '):
  try:rows.append(json.loads(l[len(a.marker)+1:]))
  except ValueError:sys.exit('FAIL: malformed receipt')
if len(rows)!=1:sys.exit('FAIL: missing or ambiguous receipt; no success claim')
d=rows[0]
for req in a.require:
 key,raw=req.split('=',1); want=json.loads(raw); actual=d
 try:
  for k in key.split('.'):actual=actual[int(k)] if isinstance(actual,list) else actual[k]
 except (KeyError,IndexError,TypeError,ValueError):sys.exit('FAIL: missing field '+key)
 if actual!=want:sys.exit('FAIL: '+key+'='+json.dumps(actual)+'; expected '+raw)
print(json.dumps({'program':a.program,'marker':a.marker,'verified':True,'scope':'printed receipt only','requirements':a.require}))

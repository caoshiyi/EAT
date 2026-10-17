"""Read a completed arena run or one canonical programs record; no active-state inference."""
import argparse,json,pathlib,re,collections
p=argparse.ArgumentParser();p.add_argument('file');p.add_argument('--program',type=int);v=p.parse_args();s=pathlib.Path(v.file).read_text()
if s.startswith('== #'):
 parts=['== #'+x for x in s.split('== #')[1:]]
 if v.program is not None:parts=[x for x in parts if re.match(r'== #'+str(v.program)+r'\s',x)]
 if len(parts)!=1:raise SystemExit('Select exactly ONE completed record with --program ID')
 s=parts[0]
print(s.splitlines()[0] if s else 'EMPTY',flush=True)
mark=next((m for m in ['--- returned ---\n','-- returned --\n'] if m in s),None)
if mark is None:raise SystemExit('NO_COMPLETED_RETURN: inspect raw error/current body')
b=s.split(mark,1)[1].split('\n--- chat',1)[0];d=json.loads(b)
if not isinstance(d,dict):print(d);raise SystemExit()
for k in ['trace','attacks','samples','injuryEvents']:
 if k in d:
  a=d[k]
  if isinstance(a,list):
   types=dict(collections.Counter(str(x[0]) for x in a if isinstance(x,list) and x)) if k=='trace' else None
   print(k,'COUNT',len(a),*(['types',types] if types is not None else []),'FIRST',a[:1],'LAST',a[-3:])
  else:print(k,'VALUE',a)
print(json.dumps({k:x for k,x in d.items() if k not in ['trace','attacks','samples','faces','beneficiaryFaces','rows','blocks','foes','items','path']},indent=1))
for k in ['foes','items']:
 if k in d:print(k,'COUNT',len(d[k]),json.dumps(d[k][:3]))

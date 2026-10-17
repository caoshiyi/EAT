import json,sys,pathlib
s=pathlib.Path(sys.argv[1]).read_text()
if '--- returned ---\n' not in s: raise SystemExit('NO_RETURN')
b=s.split('--- returned ---\n',1)[1].split('\n--- chat',1)[0]
d=json.loads(b)
print(s.splitlines()[0])
if not isinstance(d,dict): print(d);raise SystemExit()
for k in ['attacks','samples']:
 if k in d: print(k, 'ISSUED_OR_RECORDED_COUNT=',len(d[k]), 'first=',d[k][:1], 'last=',d[k][-1:])
if d.get('targetId') is not None: print('target_current', [a for a in d.get('foes',[]) if a[0]==d['targetId']])
keys=['at','world','p','hp','food','ground','closed','controls','issue','endingIssue','retreatIssue','lost','inv','targetId','arrow0','arrow','trace','items','foes']
print(json.dumps({k:d[k] for k in keys if k in d},indent=1))

for k in ['attacks','samples']:
 if k in d: print(k, 'count=',len(d[k]), 'first=',d[k][:2], 'last=',d[k][-2:])

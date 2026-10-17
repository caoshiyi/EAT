"""Gate a dependent P1 operation on a complete saved canonical arena return."""
import json, pathlib, sys
p=pathlib.Path(sys.argv[1]); s=p.read_text()
try:
 d=json.loads(s.split('--- returned ---\n',1)[1].split('\n--- chat',1)[0])
 assert isinstance(d,dict)
 ending_only='--ending-only' in sys.argv[2:]
 for k in (['endingIssue'] if ending_only else ['issue','endingIssue']): assert k in d and d[k] is None, (k,d.get(k))
 if ending_only: assert d.get('ground') is True, ('ground',d.get('ground'))
 for k in ['lost','currentCloud']: assert d.get(k) is False, (k,d.get(k))
 assert d.get('closed') is True and d.get('hp',0)>0
 for k in [a for a in sys.argv[2:] if a!='--ending-only']: assert d.get(k) is True, (k,d.get(k))
except (AssertionError,ValueError,IndexError) as e:
 print('REFUSED',p.name,str(e));sys.exit(1)
print('ACCEPTED',s.splitlines()[0],{k:d.get(k) for k in ['lifeId','p','hp','closed','issue']})

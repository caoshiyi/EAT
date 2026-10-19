"""Summarize owned eventwatch raw output; no game mutation."""
import json,sys
from pathlib import Path
p=Path(sys.argv[1]); records={}
for line in p.read_text().splitlines():
    for name in ('PHASE_SPANS','SAMPLES','START','END'):
        if line.startswith(name+' '):records[name]=json.loads(line[len(name)+1:])
if not records.get('SAMPLES'):raise SystemExit('No completed sample receipt; cannot summarize')
s=records['SAMPLES']; phases={}
for x in s:
    d=phases.setdefault(str(x['phase']),{'samples':0,'minY':None,'maxY':None})
    d['samples']+=1
    if x.get('root'):
        y=x['root']['y']; d['minY']=min(y,d['minY'] if d['minY'] is not None else y);d['maxY']=max(y,d['maxY'] if d['maxY'] is not None else y)
result={'source':str(p),'from':s[0]['at'],'through':s[-1]['at'],'sample_count':len(s),'phases':phases,'spans':records.get('PHASE_SPANS'),'p2hp':sorted(set(x['p2hp'] for x in s)),'p3metadatahp':sorted(set(x['p3hp'] for x in s if x['p3hp'] is not None)),'dragonhp':sorted(set(x['dragonhp'] for x in s if x['dragonhp'] is not None)),'ending':records.get('END')}
print(json.dumps(result,indent=2))

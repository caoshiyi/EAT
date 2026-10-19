"""Summarize actual peer watcher output; fail if no completed RESULT exists."""
import json,sys
from pathlib import Path
p=Path(sys.argv[1]);rows=[json.loads(l[7:]) for l in p.read_text().splitlines() if l.startswith('RESULT ')]
if len(rows)!=1:raise SystemExit(f'Expected one completed RESULT; found {len(rows)}')
r=rows[0];summary={'at':r['at'],'samples':r['samples'],'changes':r['changes'],'dragonRootRange':r['minmax'],'own':r['own'],'windows':[]}
for w in r['windows']:
 before=w['before'];after=w['after'];poses=[q for q in before if q.get('p3')];flags={str(q['p3']['meta'][8]) for q in poses if len(q['p3']['meta'])>8}
 summary['windows'].append({'at':w['at'],'from':w['from'],'to':w['to'],'preSamples':len(before),'postSamples':len(after),'beforeDurationMs':w['at']-before[0]['t'] if before else None,'rawPreHandFlags':sorted(flags),'lastPre':before[-1] if before else None,'firstAfter':after[0] if after else None})
print(json.dumps(summary,indent=2))

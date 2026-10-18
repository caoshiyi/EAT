"""Compact arena capture inspection; raw capture remains authoritative."""
import json,sys
from pathlib import Path
for name in sys.argv[1:]:
    text=Path(name).read_text(); lines=text.splitlines(); print(name)
    counts={}; latest={}
    for line in lines:
        label,_,tail=line.partition(' ')
        if label in ['CUT_PRE','CUT_POST','STEP_ACTUAL','PLACED','FULL_AUDIT','TERMINAL','PRIMARY_FAILURE','RETENTION_FAILURE','SEGMENT_REACHED','CAP_REFUSAL']:
            counts[label]=counts.get(label,0)+1
            try: latest[label]=json.loads(tail)
            except ValueError: latest[label]=tail
    print(lines[0] if lines else 'EMPTY',json.dumps(counts))
    for key in ['PRIMARY_FAILURE','RETENTION_FAILURE','SEGMENT_REACHED','TERMINAL']:
        if key in latest: print(key,json.dumps(latest[key]))
    print('timeout',any('timed out' in s.lower() for s in lines))

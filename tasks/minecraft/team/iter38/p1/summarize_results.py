"""Summarize actual p1 combat endings; never infer missing or truncated receipts."""
import json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parent
names=sys.argv[1:] or ['batch1.out','batch2.out','one1.out','standing1.out','standing2.out','standing3.out','standing4.out']
for name in names:
    path=root/name
    assert path.parent==root and path.suffix=='.out'
    raw=path.read_text()
    outcomes=[json.loads(line[len('OUTCOME '):]) for line in raw.splitlines() if line.startswith('OUTCOME ')]
    if len(outcomes)!=1:
        print(json.dumps({'file':name,'error':'expected exactly one actual OUTCOME','count':len(outcomes)}));continue
    r=outcomes[0]
    source=next((json.loads(line[len('LOW52_SOURCE '):]) for line in raw.splitlines() if line.startswith('LOW52_SOURCE ')),{})
    ident=re.search(r'^program #(\d+) on p1:',raw)
    print(json.dumps({'file':name,'program':int(ident[1]) if ident else None,'start':source.get('state',{}).get('at'),'end':r['at'],'attacks':r['attacks'],'boss_before':r['initialBoss'],'boss_after':r['finalBoss'],'damage':r['initialBoss']-r['finalBoss'],'ending_hp':r['ownHP'],'food':r['food'],'lower':abs(r['p']['y']-50)<.05,'full':r['full'],'issue':r['issue'],'errors':r['errors']},separators=(',',':')))

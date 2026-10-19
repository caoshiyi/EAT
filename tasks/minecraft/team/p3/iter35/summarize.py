"""Summarize retained p3 combat receipts; reports evidence, never scores victory."""
from pathlib import Path
import json,sys
p=Path(sys.argv[1]); rows=p.read_text().splitlines()
def load(prefix):
    out=[]
    for row in rows:
        if row.startswith(prefix+' '):
            try:out.append(json.loads(row[len(prefix)+1:]))
            except json.JSONDecodeError:pass
    return out
r=load('LOW_ATTACK_RESULT');h=load('HIT_RESULT')
if not r:raise SystemExit('No complete LOW_ATTACK_RESULT: reconcile canonical program/body before continuing')
r=r[-1];s=r['state'];inv=s['inv'];src=load('SOURCE');initial=src[-1]['state']['hp'] if src else None
print(json.dumps({'receipt':str(p),'attacks':r['attacks'],'before':r.get('beforeDragon',{}).get('hp'),'hit_results':[{'n':x['attacks'],'pre':x['pre'],'post':x['post']} for x in h], 'position':s['p'],'hp':s['hp'],'initial_hp':initial,'net_health_loss':None if initial is None else initial-s['hp'],'food':s['food'],'ground':s['ground'],'controls':s['controls'],'goal':s['goal'],'full10':len(r['faces'])==10 and all(x['full'] for x in r['faces']),'equipment':[x for x in inv if 'sword' in x[0] or 'pickaxe' in x[0] or x[0] in ['netherrack','cobblestone']],'failures':[x for x in rows if x.startswith(('LOW_TEST_FAIL','LOW_RETREAT_FAIL'))]},indent=2))

"""Summarize retained output without inferring hits from dispatch or protection from return."""
from pathlib import Path
import sys,json
for name in sys.argv[1:]:
 p=Path(name);lines=p.read_text().splitlines();row=next((x[7:] for x in reversed(lines) if x.startswith('RESULT ')),None)
 if row is None:print(p.name,'NO_RESULT');continue
 d=json.loads(row);src=next((json.loads(x[7:]) for x in lines if x.startswith('SOURCE ')),{})
 before=src.get('state',src);after=d.get('state',{});tr=d.get('trace',[])
 sword=lambda state: [a for a in state.get('inv',[]) if a[0]=='stone_sword']
 print(json.dumps({'file':p.name,'program':next((x for x in lines if 'program #' in x),'unknown'),'environment':d.get('environment'),'time':d.get('at'),'attack_calls':d.get('attacks'),'own_hp':[before.get('hp'),after.get('hp')],'body':after.get('p'),'sword':[sword(before),sword(after)],'observed_dragon_hp':sorted({r['dragon']['hp'] for r in tr if r.get('dragon') and r['dragon'].get('hp') is not None}),'min':d.get('min'),'effects':d.get('effects'),'full_faces':[sum(bool(r.get('full')) for r in d.get('faces',[])),len(d.get('faces',[]))],'failures':[x for x in lines if x.startswith(('FAIL','RETREATFAIL'))]},separators=(',',':')))

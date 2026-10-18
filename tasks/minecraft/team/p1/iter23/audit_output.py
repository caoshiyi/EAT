"""Summarize literal arena output; never infer world success from labels alone."""
import json, re, sys
from pathlib import Path
s=Path(sys.argv[1]).read_text()
records=[]
for line in s.splitlines():
    match=re.match(r'^([A-Z_]+) (\{.*\})$',line)
    if match:
        try: records.append((match[1],json.loads(match[2])))
        except json.JSONDecodeError: pass
states=[]
for tag,r in records:
    state=r.get('state',r)
    if isinstance(state,dict) and isinstance(state.get('hp'),(int,float)):states.append(state)
audits=[{'tag':tag,'all_full':all(c.get('full') is True for c in r['cells']),'n':len(r['cells'])} for tag,r in records if isinstance(r.get('cells'),list) and (tag.endswith('_FULL') or tag in ('FULL','FULL_AUDIT','ALL_TEN'))]
out={'program':re.search(r'program #(\d+)',s).group(1) if re.search(r'program #(\d+)',s) else None,'walk_calls':sum(tag=='WALK_END' for tag,r in records),'walk_failures':[r for tag,r in records if tag=='WALK_END' and r.get('failure')],'audits':audits,'min_sampled_hp':min((x['hp'] for x in states),default=None),'terminal':next((r for tag,r in reversed(records) if tag=='TERMINAL'),None),'errors':s.split('--- error ---',1)[1].split('--- chat',1)[0].strip() if '--- error ---' in s else None}
print(json.dumps(out,indent=2))

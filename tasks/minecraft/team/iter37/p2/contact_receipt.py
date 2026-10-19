"""Read completed arena output; summarize telemetry without asserting blocking."""
import json,math,sys
from pathlib import Path
rows={}
for line in Path(sys.argv[1]).read_text().splitlines():
 for tag in ('CONTACT_TELEMETRY','RESULT','CONTACT_COMPACT','END_SUMMARY'):
  if line.startswith(tag+' '):rows[tag]=json.loads(line[len(tag)+1:])
if 'CONTACT_COMPACT' in rows:
 t=rows['CONTACT_COMPACT'];events=[]
 for e in t.get('events',[]):
  o=dict(e);o['at']=dict(zip(t['columns'],e.get('at') or []));o['pre']=[dict(zip(t['columns'],a)) for a in e.get('pre',[])];events.append(o)
 print(json.dumps({'telemetry':True,'format':'compact','eventCount':t.get('eventCount'),'omittedEvents':t.get('omittedEvents'),'state':t.get('state'),'events':events,'endSummary':rows.get('END_SUMMARY')},indent=2))
 raise SystemExit(0)
if 'CONTACT_TELEMETRY' not in rows:raise SystemExit('No completed CONTACT_TELEMETRY receipt; no adoption-data claim.')
t=rows['CONTACT_TELEMETRY'];r=rows.get('RESULT',{});out={'telemetry':True,'events':[],'tailSamples':len(t.get('tail',[])),'state':r.get('state'),'initialBoss':r.get('dragonBefore'),'finalBoss':r.get('dragonAfter'),'attacks':r.get('attacks'),'issue':r.get('issue')}
for e in t.get('events',[]):
 pre=e.get('before',[]);a=e.get('at',{});p=pre[-1] if pre else None;o={'kind':e.get('kind'),'at':a,'packet':e.get('packet'),'ownId':e.get('ownId'),'preSamples':len(pre),'preLast':p}
 if pre:o['preDurationMs']=a.get('t',0)-pre[0].get('t',0)
 if p and p.get('dragon') and p.get('p') and p.get('yaw') is not None:
  d=p['dragon']['p'];dx,dz=d[0]-p['p'][0],d[2]-p['p'][2];n=math.hypot(dx,dz)
  if n>1e-9:o['preHorizontalRootFacingAngleDeg']=math.degrees(math.acos(max(-1,min(1,(-math.sin(p['yaw'])*dx-math.cos(p['yaw'])*dz)/n))))
 out['events'].append(o)
print(json.dumps(out,indent=2))

"""Bounded p1-only repetition. Stop on failure or new fortress evidence."""
import argparse,subprocess,json,re
from pathlib import Path
from datetime import datetime,timezone
p=argparse.ArgumentParser();p.add_argument('--count',type=int,choices=[1,2,3],default=1);p.add_argument('--prefix',required=True);p.add_argument('--walker',choices=['natural_3d_thirtytwo.js','natural_resource_walk.js'],default='natural_3d_thirtytwo.js');p.add_argument('--approach-fortress',action='store_true');p.add_argument('--planner',choices=['natural_3d_proposal.js','natural_fast_proposal.js'],default='natural_3d_proposal.js');a=p.parse_args()
if not re.fullmatch(r'[a-zA-Z0-9_]+',a.prefix):p.error('simple owned prefix required')
owned=Path('tasks/minecraft/team/p1')
for i in range(1,a.count+1):
 logs={}
 for label,script,timeout in [('plan',a.planner,20),('walk',a.walker,190)]:
  log=owned/f'{a.prefix}_{i}_{label}.log';logs[label]=log
  r=subprocess.run(['python3',str(owned/'run_p1.py'),str(owned/script),'--timeout',str(timeout),'--log',str(log)],capture_output=True,text=True)
  t=log.read_text() if log.exists() else r.stdout+r.stderr
  print(f'BATCH {i}/{a.count} {label} RC={r.returncode} LOG={log}',flush=True)
  if label=='plan':
   if r.returncode or '"proposal":null' in t:print('STOP_PLAN',t[-1600:],flush=True);raise SystemExit(1)
   continue
  matches=re.findall(r'COVERED_ENDPOINT_VERIFIED (\{[^\n]*\})',t);safe=bool(matches and re.search(r'FINAL .*dead false adopted true',t));record=json.loads(matches[-1]) if safe else None
  fortress=bool(re.search(r"LOADED_RESOURCE nether_bricks \[\s*['\"(]",t))
  stop=r.returncode or not safe or record['steps']==0 or record['hp']<17 or record['mats']<(4 if a.walker=='natural_resource_walk.js' else 24) or (fortress and not a.approach_fortress) or 'A Terrible Fortress' in t
  if safe:
   subprocess.run(['python3',str(owned/'checkpoint.py'),str(log),'--active','NONE' if stop or i==a.count else f'bounded natural batch {i+1}/{a.count} pending; inspect arena status','--next','Continue fortress/SoulSoil search after bounded result review.','--write'],capture_output=True,text=True,check=True)
  with (owned/'ITER4_LOG.md').open('a') as f:f.write(f'{datetime.now(timezone.utc).isoformat()} BATCH {a.prefix}/{i} rc={r.returncode}, verified={record}, exactlog={log.name}\n')
  print('WORLD_RESULT',json.dumps(record),flush=True)
  fortress=bool(re.search(r"LOADED_RESOURCE nether_bricks \[\s*['\"(]",t))
  if stop:
   print('STOP_REQUIRED',t[-2500:],flush=True)
   if not safe:
    header=Path('tasks/minecraft/team/P1.md');s=header.read_text();s=re.sub(r'^Active.*$',f'Active NONE. ALERT: batch {log.name} has NO VERIFIED new shelter; inspect actual p1 state immediately.',s,flags=re.M);header.write_text(s)
   raise SystemExit(0 if fortress else 1)

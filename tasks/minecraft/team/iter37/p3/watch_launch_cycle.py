"""Sequential p3-only read-only watches; bounded count, receipts retained."""
import json, subprocess, sys, time
from pathlib import Path
base=Path('tasks/minecraft/team/iter37/p3')
count=int(sys.argv[1]) if len(sys.argv)>1 else 1
if not 1<=count<=6: raise SystemExit('count 1..6 only')
upper=False
for k in range(count):
 name=base/('watchcycle_'+str(time.time_ns())+'.out')
 run=subprocess.run(['python3','tools/mc_arena.py','run','--player','p3','--timeout','45',str(base/'watch30.js')],text=True,capture_output=True,timeout=65)
 name.write_text(run.stdout+run.stderr)
 result=[line[7:] for line in run.stdout.splitlines() if line.startswith('RESULT ')]
 print(next((line for line in run.stdout.splitlines() if line.startswith('program #')),'no program header'),str(name),flush=True)
 if run.returncode or not result:
  print('STOP missing result/error; inspect actual world',run.returncode,flush=True);break
 r=json.loads(result[-1]);e=r['ending'];p=e.get('p1');d=e.get('dragon')
 print(json.dumps({'ending':e,'groups':r['groups']}),flush=True)
 if any(float(y)>50.1 for y in r.get('groups',{}) if y!='absent'): upper=True
 if e['ownHP']!=20 or not p or p['hp']<20 or not d or d['hp']<=0 or d['phase']==9:
  print('STOP transition: inspect actual world/eval if completion',flush=True);break
 if upper and p['p']['y']<50.1:
  print('STOP actor lower; inspect actual program ending/preparation before next watch',flush=True);break

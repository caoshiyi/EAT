"""P1-only finite tunnel batches; accept world postcondition, stop on first rejection."""
import argparse,json,os,re,subprocess,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--count',type=int,choices=[1,2,3],default=1);p.add_argument('--prefix',required=True);a=p.parse_args()
if not re.fullmatch('[a-zA-Z0-9_]+',a.prefix):p.error('invalid prefix')
owned=Path('tasks/minecraft/team/p1')
for k in range(a.count):
 if time.time()+150>=int(os.environ['CR_DEADLINE']):print('STOP current deadline margin',flush=True);break
 plan=Path('tasks/minecraft/team/PLAN.md').read_text()
 print('PLAN read',len(plan),'batch',k+1,flush=True)
 h=Path('tasks/minecraft/team/P1.md');txt=h.read_text();txt=re.sub(r'^- ACTIVE.*$',f'- ACTIVE {a.prefix} batch{k+1}/{a.count}, iter6_tunnel16.js timeout130; arena ending pending.',txt,flags=re.M);h.write_text(txt)
 log=owned/f'{a.prefix}_{k+1}.log'
 r=subprocess.run(['python3',str(owned/'run_p1.py'),str(owned/'iter6_tunnel16.js'),'--timeout','130','--log',str(log)],capture_output=True,text=True)
 s=log.read_text() if log.exists() else r.stdout+r.stderr
 m=re.findall(r'TUNNEL_ENDPOINT_VERIFIED (\{[^\n]+\})',s)
 accepted=bool(r.returncode==0 and m and re.search(r'FINAL .*dead false adopted true',s))
 state=json.loads(m[-1]) if accepted else None
 print('WORLD',json.dumps(state),'log',log,'rc',r.returncode,flush=True)
 with (owned/'ITER6_LOG.md').open('a') as f:f.write(f'{time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())} {log.name}: accepted={accepted} state={state}\n')
 if not accepted:
  print('STOP unverified ending',s[-3500:],flush=True);break
 h=Path('tasks/minecraft/team/P1.md');text=h.read_text();text=re.sub(r'^- Actual .*$',f'- Actual {log.name}: endpoint{state["origin"]}, HP{state["hp"]}/food{state["food"]}; continuous tunnel base{state["base"]}, entire boundary full; mats{state["mats"]}.',text,flags=re.M);text=re.sub(r'^- ACTIVE.*$',f'- ACTIVE {"next finite tunnel batch pending" if k+1<a.count else "NONE"}; driver {a.prefix} batch{k+1}/{a.count} completed. See arena log for exact body/kit.',text,flags=re.M);h.write_text(text)
 if not accepted or state['steps']==0 or state['hp']<17 or state['steps']<16:
  print('STOP first rejection/partial',s[-3500:],flush=True);break

"""Bounded p1-only courier batches. Stops on any failed/ambiguous retained endpoint."""
import argparse,datetime,json,math,os,re,subprocess,sys,time
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('x',type=int);ap.add_argument('y',type=int);ap.add_argument('z',type=int);ap.add_argument('--batches',type=int,choices=[1,2,3],default=1);ap.add_argument('--reclaim',action='store_true');a=ap.parse_args();p=Path(__file__).parent;root=Path(os.environ['EAT_ROOT']);foot=[a.x,a.y,a.z]
for k in range(a.batches):
 if time.time()>=float(os.environ.get('CR_DEADLINE','inf')):print('CURRENT_DEADLINE_REACHED',flush=True);break
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S');name=f'auto_{stamp}_{k}';js=name+'.js';log=name+'.log';gen=subprocess.run([sys.executable,str(p/'gen_route.py'),*map(str,foot),'--steps','100','--out',js]+(['--reclaim'] if a.reclaim else []),cwd=root,text=True,capture_output=True)
 if gen.returncode:print('GEN_FAILED',gen.stdout,gen.stderr,flush=True);break
 print('GENERATED',gen.stdout.strip(),flush=True)
 h=p.parent.parent/'P1.md';s=h.read_text();s=re.sub(r'ACTIVE .*?; (?:previous )?completedlog','ACTIVE '+js+' timeout190; previous completedlog',s,count=1);h.write_text(s)
 try:
  result=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p1','--timeout','190',str(p/js)],cwd=root,text=True,capture_output=True,timeout=215)
 except subprocess.TimeoutExpired as e:
  (p/log).write_text((e.stdout or b'').decode() if isinstance(e.stdout,bytes) else (e.stdout or ''));print('HOST_TIMEOUT_NO_COMPLETION',log,flush=True);break
 (p/log).write_text(result.stdout+'\n'+result.stderr);finals=re.findall(r'^FINAL (\{.*\})$',result.stdout,re.M);results=re.findall(r'^ROUTE_RESULT (\{.*\})$',result.stdout,re.M)
 if not finals or not results:print('MISSING_WORLD_COMPLETION',result.returncode,log,flush=True);break
 d=json.loads(finals[-1]);r=json.loads(results[-1]);subprocess.run([sys.executable,str(p/'record.py'),log],cwd=root,check=True)
 print('ACTUAL_BATCH',json.dumps({'log':log,'body':d['p'],'hp':d['hp'],'full':d['full'],'result':r}),flush=True)
 if result.returncode or r.get('issue') or r.get('steps',0)<1 or d.get('dead') or d.get('lost') or not d.get('full') or d.get('hp',0)<17:print('STOP_RETAINED_CHECK',flush=True);break
 new=[math.floor(d['p'][axis]) for axis in ['x','y','z']]
 if new==foot:print('STOP_NO_PROGRESS',flush=True);break
 foot=new
print('BATCH_WRAPPER_DONE',foot,flush=True)

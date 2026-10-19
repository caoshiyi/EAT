"""Read-only arena monitor. No programs, messages, resets or direct world access."""
import argparse,datetime,json,pathlib,re,subprocess,sys,time
p=argparse.ArgumentParser();p.add_argument('--count',type=int,default=1);p.add_argument('--interval',type=float,default=50);a=p.parse_args()
root=pathlib.Path('tasks/minecraft/team/p4/iter30/watch');root.mkdir(exist_ok=True)
def call(args):
 r=subprocess.run([sys.executable,'tools/mc_arena.py']+args,text=True,capture_output=True,timeout=15)
 return dict(rc=r.returncode,stdout=r.stdout,stderr=r.stderr)
for n in range(a.count):
 at=datetime.datetime.now(datetime.timezone.utc);key=at.strftime('%H%M%S');r={}
 for env,prefix in [('live',[]),('sb',['--sandbox'])]:
  st=call(prefix+['status']);r[env]=st
  rec=call(prefix+['programs','--player','p2','--last','1','--full'])
  m=re.search(r'^== #(\d+)',rec['stdout'],re.M)
  if m:
   f=root/(env+'_P2_'+m[1]+'.txt')
   if not f.exists():f.write_text(rec['stdout']+rec['stderr'])
 r['chat']=call(['chat','--last','12']);r['deaths']=call(['--sandbox','events','--type','death','--last','8'])
 (root/(key+'.json')).write_text(json.dumps(dict(at=at.isoformat(),**r),indent=2)+'\n')
 def p2status(v):return next((s for s in v['stdout'].splitlines() if s.startswith('p2:')),f"ERROR rc{v['rc']}")
 print(json.dumps(dict(at=at.isoformat(),live=p2status(r['live']),sb=p2status(r['sb']),snapshot=key+'.json')),flush=True)
 if n+1<a.count:time.sleep(min(60,max(1,a.interval)))

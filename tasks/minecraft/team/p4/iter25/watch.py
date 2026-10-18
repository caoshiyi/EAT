"""Bounded read-only live watcher using arena CLI only; no player programs."""
import argparse,datetime,json,pathlib,re,subprocess,sys,time
p=argparse.ArgumentParser();p.add_argument('--seconds',type=float,default=45);p.add_argument('--since',type=int);a=p.parse_args()
if not 0<=a.seconds<=50:raise SystemExit('bounded <=50seconds')
b=pathlib.Path('tasks/minecraft/team/p4/iter25');state=b/'watch_cursor.json'
prev=json.loads(state.read_text()) if state.exists() else {'chat':0,'status':''}
if a.since is not None:prev['chat']=a.since
start=time.monotonic();new=[];changed=[]
def arena(*args):
 r=subprocess.run([sys.executable,'tools/mc_arena.py',*args],capture_output=True,text=True,timeout=8)
 if r.returncode:raise RuntimeError(r.stderr or r.stdout)
 return r.stdout
while True:
 chat=arena('chat','--since',str(prev['chat']))
 for line in chat.splitlines():
  m=re.match(r'#(\d+) ',line)
  if m and int(m[1])>prev['chat']:prev['chat']=int(m[1]);new.append(line)
 status=arena('status')
 if status!=prev['status']:
  changed.append(status);prev['status']=status
 if time.monotonic()-start>=a.seconds:break
 time.sleep(min(5,a.seconds-(time.monotonic()-start)))
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat();tag='watch_'+datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')
(b/(tag+'.json')).write_text(json.dumps({'env':'LIVE_ITER25','at':stamp,'chat':new,'statusChanges':changed},indent=2));state.write_text(json.dumps(prev))
print('LIVE_ITER25',stamp,'newChat',len(new),'statusChanges',len(changed),'raw',tag+'.json')
print('\n'.join(new))
if changed:print(changed[-1])

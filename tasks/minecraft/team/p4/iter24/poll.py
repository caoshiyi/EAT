"""Read-only arena updates; exact text retained, never classifies success."""
import argparse,datetime,json,pathlib,subprocess,sys
p=argparse.ArgumentParser();p.add_argument('--since',type=int,required=True);p.add_argument('--status',action='store_true');a=p.parse_args()
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f')
out=pathlib.Path('tasks/minecraft/team/p4/iter24/polls');out.mkdir(exist_ok=True)
commands=[['chat','--since',str(a.since)],['events','--type','death','--last','5']]
if a.status:commands.append(['status'])
results=[]
for args in commands:
 r=subprocess.run([sys.executable,'tools/mc_arena.py',*args],capture_output=True,text=True)
 results.append(dict(command=args,exit_code=r.returncode,stdout=r.stdout,stderr=r.stderr,at=datetime.datetime.now(datetime.timezone.utc).isoformat()))
f=out/(stamp+'.json');f.write_text(json.dumps(results,indent=2))
for r in results:
 print(' '.join(r['command']),r['exit_code'],r['at'])
 print(r['stdout'],end='')
 if r['stderr']:print('STDERR:',r['stderr'])
print('RAW',f,'Sequential/non-atomic observation; chat --since is inclusive: next input is largest returned ID + 1.')
if any(r['exit_code'] for r in results):raise SystemExit(1)

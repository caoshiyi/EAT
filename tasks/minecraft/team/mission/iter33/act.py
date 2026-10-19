#!/usr/bin/env python3
"""P2-only bounded runner: preserve raw output and canonical ID, never infer success."""
import datetime, hashlib, json, os, pathlib, re, subprocess, sys
root=pathlib.Path(os.environ['EAT_ROOT']); os.chdir(root)
d=pathlib.Path('tasks/minecraft/team/mission/iter33'); name=sys.argv[1]; timeout=int(sys.argv[2])
if not re.fullmatch(r'[a-zA-Z0-9_]+',name) or not 1<=timeout<=300: raise SystemExit('bad name/timeout')
f=d/(name+'.js'); source=f.read_text()
if 'DESCENT_RETURN_OBSERVATION' in source and name not in ['inspect','secure_survey','branch_survey','route_survey','route_generator']:
 raise SystemExit('REJECTED retired ascent-on-threat helper; rebuild from secure_core.js before action')
check=subprocess.run(['node','--check'],input='async function arenaProgram(bot,Movements,goals){\n'+source+'\n}',text=True,capture_output=True)
if check.returncode: print(check.stderr); raise SystemExit(check.returncode)
t0=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p2','--timeout',str(timeout),str(f)],text=True,capture_output=True)
tag=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f'); dest=d/(name+'_'+tag)
dest.with_suffix('.out').write_text(r.stdout+'\nSTDERR\n'+r.stderr)
m=re.search(r'program #(\d+) on p2:',r.stdout); returned=None
try: returned=json.loads(r.stdout.split('--- returned ---\n',1)[1].split('\n--- chat',1)[0])
except (IndexError,ValueError): pass
receipt=dict(start=t0,end=datetime.datetime.now(datetime.timezone.utc).isoformat(),player='p2',environment='live',program=int(m[1]) if m else None,cli_rc=r.returncode,source=str(f),sha256=hashlib.sha256(source.encode()).hexdigest(),raw=str(dest.with_suffix('.out')),returned=returned)
dest.with_suffix('.json').write_text(json.dumps(receipt,indent=2)); dest.with_suffix('.js').write_text(source)
with (d/'ACTIONS.jsonl').open('a') as o: o.write(json.dumps({k:v for k,v in receipt.items() if k!='returned'})+'\n')
summary={k:v for k,v in receipt.items() if k not in ['returned','sha256']}; summary['issues']=[line[:350] for line in r.stdout.splitlines() if any(t in line for t in ['FAIL','Error:','BODY_HURT','NET_GLOBAL_PROGRESS','MOTION_EFFECT'])]; summary['state']=({k:v for k,v in returned.items() if k not in ['faces','inv']} if isinstance(returned,dict) else returned);
if isinstance(returned,dict):
 summary['inventory']=returned.get('inv'); summary['faces_full']=all(b.get('full') for b in returned.get('faces',[])) if 'faces' in returned else None
print(json.dumps(summary)); sys.exit(r.returncode)

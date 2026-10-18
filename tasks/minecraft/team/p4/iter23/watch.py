"""Read-only arena observer. No player programs or world changes. Run from EAT_ROOT."""
import argparse, datetime, json, pathlib, re, subprocess, time

parser=argparse.ArgumentParser()
parser.add_argument('--seconds',type=int,default=0)
parser.add_argument('--period',type=int,default=30)
args=parser.parse_args()
root=pathlib.Path('tasks/minecraft/team/p4/iter23')
statepath=root/'watch_state.json'
state=json.loads(statepath.read_text()) if statepath.exists() else {'chat':0,'status':None}
deadline=time.monotonic()+args.seconds
while True:
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    for kind,cmd in [('chat',['chat','--since',str(state['chat'])]),('status',['status'])]:
        try:
            result=subprocess.run(['python3','tools/mc_arena.py',*cmd],capture_output=True,text=True,timeout=20)
            record={'captured':now,'kind':kind,'rc':result.returncode,'stdout':result.stdout,'stderr':result.stderr}
            with (root/'watch.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
            if result.returncode:
                print('OBSERVER_ERROR',json.dumps(record),flush=True)
                continue
            if kind=='chat':
                previous=state['chat']
                ids=[int(x) for x in re.findall(r'^#(\d+) ',result.stdout,re.M)]
                if ids:state['chat']=max(ids)
                # Arena --since is inclusive; avoid reporting the last entry again.
                entries=re.split(r'(?m)(?=^#\d+ )',result.stdout)
                fresh=[entry for entry in entries if (match:=re.match(r'^#(\d+) ',entry)) and int(match.group(1))>previous]
                if fresh:print('NEW_CHAT',now,''.join(fresh),flush=True)
            elif state['status']!=result.stdout:
                print('STATUS_CHANGE',now,result.stdout,flush=True)
                state['status']=result.stdout
        except Exception as e:
            print('OBSERVER_EXCEPTION',now,repr(e),flush=True)
    statepath.write_text(json.dumps(state,indent=2)+'\n')
    if time.monotonic()>=deadline:break
    time.sleep(min(args.period,max(0,deadline-time.monotonic())))

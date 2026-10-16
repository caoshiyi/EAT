"""Read-only arena evidence capture. Never invokes run/say/up/down/eval.
Usage: python3 tasks/minecraft/team/knowledge/review_watch.py [--once]
No server paths or network APIs are read directly.
"""
import argparse, datetime, json, os, pathlib, subprocess, time
ROOT=pathlib.Path(os.environ['EAT_ROOT'])
OUT=ROOT/'tasks/minecraft/team/knowledge'
COMMANDS={'status':['status'],'chat':['chat','--last','25'],'events':['events','--last','20'],'programs':['programs','--last','16','--full']}
def sample():
    stamp=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    summary=[]
    for kind,args in COMMANDS.items():
        result=subprocess.run(['python3','tools/mc_arena.py',*args],cwd=ROOT,text=True,capture_output=True,timeout=20)
        payload={'time':stamp,'command':args,'exit':result.returncode,'stdout':result.stdout,'stderr':result.stderr}
        dest=OUT/f'latest_{kind}.json'
        old=json.loads(dest.read_text()) if dest.exists() else {}
        if old.get('stdout')!=payload['stdout'] or old.get('exit')!=payload['exit']:
            with (OUT/'watch_history.jsonl').open('a') as f:f.write(json.dumps(payload)+'\n')
            dest.write_text(json.dumps(payload,indent=2)+'\n')
            summary.append(f'{kind}:{len(result.stdout)}bytes/exit{result.returncode}')
    print(stamp, ' '.join(summary) or 'unchanged',flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--once',action='store_true');args=ap.parse_args()
    while True:
        sample()
        if args.once:break
        time.sleep(45)

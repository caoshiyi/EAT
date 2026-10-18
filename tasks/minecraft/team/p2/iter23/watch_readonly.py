"""Read-only arena monitor. Never runs a player, modifies tools, or reads server files."""
import argparse, datetime, pathlib, re, subprocess, time
p=argparse.ArgumentParser(); p.add_argument('--seconds',type=float,default=1); p.add_argument('--interval',type=float,default=1); a=p.parse_args()
root=pathlib.Path('tasks/minecraft/team/p2/iter23'); end=time.monotonic()+a.seconds; cursor=None; old=None
while True:
    stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
    def query(args):
        r=subprocess.run(['python3','tools/mc_arena.py',*args],capture_output=True,text=True,timeout=20)
        if r.returncode: raise RuntimeError(f'{args}: {r.returncode}: {r.stderr}')
        return r.stdout
    state=query(['status'])
    if state!=old: print('STATE',stamp,'\n'+state,flush=True); old=state
    chat=query(['chat','--last','6'] if cursor is None else ['chat','--since',str(cursor+1)])
    if chat.strip():
        print('CHAT',stamp,'\n'+chat,flush=True)
        ids=[int(x) for x in re.findall(r'^#(\d+) ',chat,re.M)]
        if ids: cursor=max(ids)
    with (root/'watch_snapshots.log').open('a') as f: f.write(stamp+'\n'+state+chat+'\n')
    if time.monotonic()>=end: break
    time.sleep(min(a.interval,max(0,end-time.monotonic())))

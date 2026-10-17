"""Read-only arena snapshot collector. Never runs player programs or controls the world."""
import argparse, concurrent.futures, datetime, json, os, pathlib, subprocess, time
ROOT=pathlib.Path(os.environ['EAT_ROOT'])
OUT=ROOT/'tasks/minecraft/team/mission/iter15/observations'
COMMANDS={'status':['status'],'chat':['chat','--last','30'],'events':['events','--last','12'],'programs':['programs','--last','12']}
def collect():
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder=OUT/stamp; folder.mkdir(parents=True,exist_ok=True)
    def one(pair):
        name,args=pair
        p=subprocess.run(['python3','tools/mc_arena.py',*args],cwd=ROOT,text=True,capture_output=True,timeout=25)
        (folder/(name+'.txt')).write_text(p.stdout)
        (folder/(name+'.stderr')).write_text(p.stderr)
        return name,{'exit_code':p.returncode,'bytes':len(p.stdout),'stderr':p.stderr[:500]}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results=dict(pool.map(one,COMMANDS.items()))
    receipt={'utc':stamp,'path':str(folder.relative_to(ROOT)),'results':results}
    (OUT/'latest.json').write_text(json.dumps(receipt,indent=2))
    print(json.dumps(receipt),flush=True)
    return receipt
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--loop',action='store_true');ap.add_argument('--interval',type=int,default=45);a=ap.parse_args()
    deadline=int(os.environ['CR_DEADLINE'])
    while time.time()<deadline:
        collect()
        if not a.loop:break
        time.sleep(min(a.interval,max(0,deadline-time.time())))

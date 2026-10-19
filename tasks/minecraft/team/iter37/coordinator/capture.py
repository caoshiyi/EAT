"""Read-only arena/evaluator evidence capture; never controls a player."""
import argparse,datetime,json,subprocess
from pathlib import Path
ap=argparse.ArgumentParser(); ap.add_argument('--eval',action='store_true'); ap.add_argument('--status-only',action='store_true'); a=ap.parse_args()
root=Path(__file__).resolve().parent
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
commands={'status':['python3','tools/mc_arena.py','status']}
if not a.status_only:
 commands.update(programs=['python3','tools/mc_arena.py','programs','--last','8','--full'],chat=['python3','tools/mc_arena.py','chat','--last','24'],events=['python3','tools/mc_arena.py','events','--last','16'])
if a.eval: commands['eval']=['python3','tools/eval_minecraft.py']
for kind,cmd in commands.items():
 t=datetime.datetime.now(datetime.timezone.utc).isoformat()
 try:
  p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=45)
  out=p.stdout; rc=p.returncode
 except subprocess.TimeoutExpired as e: out=str(e); rc='timeout'
 path=root/(stamp+'_'+kind+'.txt'); path.write_text(out)
 print(json.dumps({'at':t,'kind':kind,'returncode':rc,'path':str(path),'bytes':len(out),'save_failed':'save-all failed' in out}))

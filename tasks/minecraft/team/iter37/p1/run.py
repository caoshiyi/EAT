"""Owned p1 runner: preserve arena stdout/stderr, environment and exact submitted hash."""
from pathlib import Path
import subprocess,sys,datetime,hashlib,json,os
root=Path(__file__).resolve().parent
file=(root/sys.argv[1]).resolve()
assert file.parent==root and file.suffix=='.js'
sandbox='--sandbox' in sys.argv[2:]
timeout=next((s for s in sys.argv[2:] if s.isdigit()),'40')
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')
args=['python3','tools/mc_arena.py']+(['--sandbox'] if sandbox else [])+['run','--player','p1','--timeout',timeout,str(file)]
meta={'args':args,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'role':os.getenv('EAT_ROLE'),'iter':os.getenv('EAT_ITER'),'sandbox':sandbox}
base=root/f"{'SB' if sandbox else 'LIVE'}_{file.stem}_{stamp}"
Path(str(base)+'.json').write_text(json.dumps(meta,indent=2))
r=subprocess.run(args,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
Path(str(base)+'.out').write_text(r.stdout)
# Read the world immediately after return, before printing potentially large logs.
check=subprocess.run(['python3','tools/mc_arena.py']+(['--sandbox'] if sandbox else [])+['status'],text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
Path(str(base)+'.endstatus').write_text(check.stdout)
player_line=next((line for line in check.stdout.splitlines() if line.startswith('p1:')),'p1 state unavailable: '+check.stdout[:300])
print('END_NATIVE_STATUS '+player_line,flush=True)
print(r.stdout,end='');sys.exit(r.returncode)

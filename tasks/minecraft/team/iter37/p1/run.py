"""Owned p1 runner: preserve arena stdout/stderr, environment and exact submitted hash."""
from pathlib import Path
import subprocess,sys,datetime,hashlib,json,os,re
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
Path(str(base)+'.submitted.js').write_text(file.read_text())
r=subprocess.run(args,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
Path(str(base)+'.out').write_text(r.stdout)
# Read the world immediately after return, before printing potentially large logs.
check=subprocess.run(['python3','tools/mc_arena.py']+(['--sandbox'] if sandbox else [])+['status'],text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
Path(str(base)+'.endstatus').write_text(check.stdout)
player_line=next((line for line in check.stdout.splitlines() if line.startswith('p1:')),'p1 state unavailable: '+check.stdout[:300])
print('END_NATIVE_STATUS '+player_line,flush=True)
match=re.search(r'^p1: \(([-\d.]+), ([-\d.]+), ([-\d.]+)\) in (\w+), health ([-\d.]+)',player_line)
if match and file.name.startswith('live_'):
    px,py,pz=map(float,match.group(1,2,3)); dim=match.group(4); hp=float(match.group(5))
    if dim=='the_end' and hp>0 and 50.1<py<59.5 and -6.5<px<-2.5 and abs(pz-4.5)<1.4:
        recovery=root/'emergency_lower.js'
        recover_args=['python3','tools/mc_arena.py']+(['--sandbox'] if sandbox else [])+['run','--player','p1','--timeout','90',str(recovery)]
        Path(str(base)+'.recovery.json').write_text(json.dumps({'trigger':player_line,'args':recover_args,'sha256':hashlib.sha256(recovery.read_bytes()).hexdigest()},indent=2))
        print('UPPER_END_AUTORECOVERY '+player_line,flush=True)
        recovered=subprocess.run(recover_args,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        Path(str(base)+'.recovery.out').write_text(recovered.stdout)
        after=subprocess.run(['python3','tools/mc_arena.py']+(['--sandbox'] if sandbox else [])+['status'],text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        Path(str(base)+'.recovery.endstatus').write_text(after.stdout)
        print('AFTER_AUTORECOVERY '+next((x for x in after.stdout.splitlines() if x.startswith('p1:')),after.stdout[:300]),flush=True)
        print(recovered.stdout,end='')
print(r.stdout,end='');sys.exit(r.returncode)

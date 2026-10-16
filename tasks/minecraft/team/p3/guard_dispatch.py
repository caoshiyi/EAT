"""Observe new p4 guard start; optionally dispatch one p3 arena program immediately.
SUPERSEDED by portal_route_sync.js event barrier. Dispatch path NOT VALIDATED.
No server access. Read-only by default. Requires --after chat id to exclude stale starts.
"""
import argparse, subprocess, sys, time, re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--after',type=int,required=True);p.add_argument('--timeout',type=int,default=65);p.add_argument('--program');p.add_argument('--run-timeout',type=int,default=60);a=p.parse_args()
if a.program and not Path(a.program).resolve().is_relative_to(Path('tasks/minecraft/team/p3').resolve()):raise SystemExit('program must be owned p3 file')
base=[sys.executable,'tools/mc_arena.py'];deadline=time.monotonic()+a.timeout;cursor=a.after
while time.monotonic()<deadline:
 r=subprocess.run(base+['chat','--since',str(cursor)],capture_output=True,text=True,timeout=8)
 if r.returncode:raise SystemExit(r.stderr)
 starts=[];aborted=False
 for line in r.stdout.splitlines():
  m=re.match(r'#(\d+) ',line)
  if not m:continue
  n=int(m.group(1))
  if n<=cursor:continue
  cursor=n
  if ' p4:' in line:
   if 'READY COVERSTART' in line:starts.append(line);aborted=False
   elif 'COVERABORT' in line or 'COVEREND' in line:aborted=True
 if starts and not aborted:
  print('FRESH GUARD',starts[-1],flush=True)
  if a.program:raise SystemExit(subprocess.run(base+['run','--player','p3','--timeout',str(a.run_timeout),a.program]).returncode)
  raise SystemExit(0)
 time.sleep(1)
print('NO NEW GUARD; no program dispatched',flush=True)
raise SystemExit(2)

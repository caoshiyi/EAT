"""Read-only arena evidence capture. No player programs or evaluations are run."""
from pathlib import Path
from datetime import datetime, timezone
import argparse, subprocess, sys, os
p=argparse.ArgumentParser();p.add_argument('--label',default='routine observation');a=p.parse_args()
if Path.cwd().resolve()!=Path(os.environ['EAT_ROOT']).resolve():raise SystemExit('Run from EAT_ROOT')
now=lambda:datetime.now(timezone.utc).isoformat(timespec='seconds')
sections=[f'Captured {now()}\nLabel: {a.label}\nSequential observations; world continues. This is NOT an evaluation score.\n']
for title,args in [('STATUS',['status']),('RECENT EVENTS',['events','--last','5']),('LATEST P3 PROGRAM',['programs','--player','p3','--last','1'])]:
 r=subprocess.run([sys.executable,'tools/mc_arena.py',*args],capture_output=True,text=True,timeout=15)
 sections.append(f'\n{title} at {now()} (exit {r.returncode})\n{r.stdout}{r.stderr}')
 if r.returncode:raise SystemExit('\n'.join(sections))
target=Path('tasks/minecraft/team/p3/STATE.txt');tmp=target.with_suffix('.tmp');tmp.write_text('\n'.join(sections));tmp.replace(target)
print(f'Wrote {target} at {now()}')

"""Read-only arena capture. Keep source+raw output; show output alone for review."""
import argparse, pathlib, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('player',choices=['p1','p2','p3','p4']);p.add_argument('tag');p.add_argument('--last',type=int,default=2);a=p.parse_args()
base=pathlib.Path('tasks/minecraft/team/p4/iter24');base.mkdir(exist_ok=True)
r=subprocess.run([sys.executable,'tools/mc_arena.py','programs','--player',a.player,'--last',str(a.last),'--full'],text=True,capture_output=True)
f=base/(a.tag+'.raw.txt');f.write_text(r.stdout+'\nSTDERR:\n'+r.stderr)
if r.returncode: raise SystemExit(r.stderr)
for record in r.stdout.split('== #')[1:]:
 lines=record.splitlines();print('== #'+lines[0])
 # Source is preserved in raw. Output labels are supplied by the arena.
 markers=[(record.find(s),s) for s in ['\n-- output --\n','\n-- returned --\n','\n-- error --\n'] if s in record]
 if markers: print(record[min(x[0] for x in markers):].rstrip())
 else: print('[no output/return section; source retained in '+str(f)+']')
print('RAW',f)

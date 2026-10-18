"""Read-only exact completed arena capture; environment and generation mandatory."""
import argparse, pathlib, subprocess, sys, datetime, re
p=argparse.ArgumentParser();p.add_argument('player',choices=['p1','p2','p3','p4']);p.add_argument('tag');p.add_argument('--env',choices=['live','sandbox'],required=True);p.add_argument('--generation',required=True);p.add_argument('--last',type=int,default=4);p.add_argument('--ids',default='');a=p.parse_args()
cmd=[sys.executable,'tools/mc_arena.py']+(['--sandbox'] if a.env=='sandbox' else [])+['programs','--player',a.player,'--last',str(a.last),'--full']
r=subprocess.run(cmd,text=True,capture_output=True);base=pathlib.Path('tasks/minecraft/team/p4/iter26'); meta=f'CAPTURE env={a.env} generation={a.generation} captured={datetime.datetime.now(datetime.timezone.utc).isoformat()}\n'
(base/(a.tag+'.raw.txt')).write_text(meta+r.stdout+'\nSTDERR:\n'+r.stderr)
if r.returncode: raise SystemExit(r.stderr)
print(meta,end=''); ids=set(a.ids.split(',')) if a.ids else None
for record in r.stdout.split('== #')[1:]:
 lines=record.splitlines();rid=lines[0].split()[0]
 if ids and rid not in ids:continue
 print('== #'+lines[0]);markers=[record.find(s) for s in ['\n-- output --\n','\n-- returned --\n','\n-- error --\n'] if s in record]
 print(record[min(markers):].rstrip() if markers else '[no output/return section; source retained]')

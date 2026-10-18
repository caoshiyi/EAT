"""Read arena records, preserve exact output, show outputs without repeated program sources.
No player programs or actions are run. --sandbox belongs before arena subcommand.
"""
import argparse
import pathlib
import subprocess
import sys
p=argparse.ArgumentParser()
p.add_argument('--player',choices=['p1','p2','p3','p4'],default='p1')
p.add_argument('--sandbox',action='store_true')
p.add_argument('--last',type=int,default=3)
p.add_argument('--out',required=True)
a=p.parse_args()
cmd=[sys.executable,'tools/mc_arena.py']+(['--sandbox'] if a.sandbox else [])+['programs','--player',a.player,'--last',str(a.last),'--full']
r=subprocess.run(cmd,capture_output=True,text=True)
pathlib.Path(a.out).write_text(r.stdout+('\nSTDERR:\n'+r.stderr if r.stderr else ''))
if r.returncode:
 print(r.stdout,r.stderr,file=sys.stderr);sys.exit(r.returncode)
show=False
for line in r.stdout.splitlines():
 if line.startswith('== #'):
  print(line);show=False
 elif line in ['-- output --','-- returned --']:
  show=True;print(line)
 elif show and not (line.startswith('FULL_AUDIT ') or line.startswith('HOSTILE_BARRIERS ')):
  print(line)
 elif show and line.startswith('FULL_AUDIT '):
  import json
  try:
   j=json.loads(line[len('FULL_AUDIT '):]);s=j['state'];print('AUDIT',j['sample'],s['at'],s['p'],'HP',s['hp'],'food',s['food'],'full',sum(c['full'] for c in j['cells']),'/',len(j['cells']))
  except Exception:
   print(line)

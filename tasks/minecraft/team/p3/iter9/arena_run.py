"""Own p3 only: preserve full arena output and print a bounded, explicit summary."""
import argparse, json, os, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('program');p.add_argument('log');p.add_argument('--timeout',type=int,default=60);a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']); prog=(root/a.program).resolve(); log=(root/a.log).resolve(); own=(root/'tasks/minecraft/team/p3').resolve()
if not prog.is_relative_to(own) or not log.is_relative_to(own):sys.exit('program and log must be owned p3 paths')
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p3','--timeout',str(a.timeout),str(prog)],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
log.write_text(r.stdout);print(r.stdout.splitlines()[0] if r.stdout else '(empty arena output)');print('RAW',log.relative_to(root))
from arena_summary import render
print(render(r.stdout))
sys.exit(r.returncode)

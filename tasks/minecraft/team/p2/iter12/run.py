"""Compile one owned JS program before dispatch; preserve raw arena receipt."""
import argparse, os, pathlib, subprocess, sys
root=pathlib.Path(os.environ['EAT_ROOT']); owned=root/'tasks/minecraft/team/p2/iter12'
a=argparse.ArgumentParser();a.add_argument('name');a.add_argument('--timeout',type=int,default=60);v=a.parse_args()
p=(owned/v.name).resolve()
if not p.is_relative_to(owned.resolve()) or p.suffix!='.js':raise SystemExit('owned JS only')
check=owned/'.syntax_check.js'
check.write_text('async function arena(bot, Movements, goals) {\n'+p.read_text()+'\n}')
r=subprocess.run(['node','--check',str(check)],cwd=root,capture_output=True,text=True)
if r.returncode:print(r.stderr);raise SystemExit(r.returncode)
r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p2','--timeout',str(v.timeout),str(p)],cwd=root,capture_output=True,text=True)
p.with_suffix('.out').write_text(r.stdout+r.stderr);print(r.stdout+r.stderr);sys.exit(r.returncode)

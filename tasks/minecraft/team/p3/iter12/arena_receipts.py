#!/usr/bin/env python3
"""Read arena program receipts without repeating program source. Never runs a player."""
import argparse, os, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument("player",choices=("p1","p2","p3","p4"));p.add_argument("--last",type=int,default=1);a=p.parse_args()
if not 1<=a.last<=20:p.error("--last must be 1..20")
root=pathlib.Path(os.environ["EAT_ROOT"])
r=subprocess.run([sys.executable,str(root/"tools/mc_arena.py"),"programs","--player",a.player,"--last",str(a.last),"--full"],cwd=root,text=True,capture_output=True,timeout=20)
if r.returncode:sys.stderr.write(r.stderr or r.stdout);sys.exit(r.returncode)
records=re.split(r"(?=^== #)",r.stdout,flags=re.M)
for rec in records:
 if not rec.strip():continue
 lines=rec.splitlines();print(lines[0])
 starts=[i for i,x in enumerate(lines) if x in ("-- output --","-- returned --")]
 if starts:print("\n".join(lines[min(starts):]))
 else:print("[No completion receipt in record; do not infer success.]")

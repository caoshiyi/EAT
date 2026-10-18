"""Read-only arena record triage. Full raw text retained when --save is supplied."""
import argparse, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument("player",choices=["p1","p2","p3","p4"]);p.add_argument("-n",type=int,default=2);p.add_argument("--save");a=p.parse_args()
if not 1<=a.n<=10:p.error("n must be 1..10")
r=subprocess.run([sys.executable,"tools/mc_arena.py","programs","--player",a.player,"--last",str(a.n),"--full"],text=True,capture_output=True,check=True)
if a.save:
 dest=pathlib.Path("tasks/minecraft/team/p2/iter20")/a.save
 if dest.resolve().parent!=pathlib.Path("tasks/minecraft/team/p2/iter20").resolve():p.error("save must be a filename")
 dest.write_text(r.stdout)
for s in re.split(r"(?m)(?=^== #)",r.stdout):
 if not s.strip():continue
 print(s.splitlines()[0])
 if "-- output --" not in s and "-- returned --" not in s:
  print("\n".join(s.splitlines()[1:])[-1100:]);continue
 out=s[s.find("-- output --"):] if "-- output --" in s else s[s.find("-- returned --"):]
 print(out if len(out)<4500 else out[:1500]+"\n[TRIAGE ONLY: full record retained, middle omitted]\n"+out[-3000:])

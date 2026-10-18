"""Read-only completed arena record capture. Never runs a player program.
Writes each full canonical record, prints only its complete output/return.
Source must still be inspected separately for any methods audit.
"""
import argparse, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('player',choices=['p1','p2','p4']);p.add_argument('-n',type=int,default=1);a=p.parse_args()
if not 1<=a.n<=10:p.error('n must be 1..10')
r=subprocess.run([sys.executable,'tools/mc_arena.py','programs','--player',a.player,'--last',str(a.n),'--full'],capture_output=True,text=True,check=True)
root=pathlib.Path('tasks/minecraft/team/p2/iter21/records');root.mkdir(exist_ok=True)
for s in re.split(r'(?m)(?=^== #)',r.stdout):
 if not s.strip():continue
 m=re.match(r'== #(\d+) ',s)
 if not m:print(s);continue
 dest=root/(a.player+'_'+m[1]+'.txt');dest.write_text(s)
 print(s.splitlines()[0]);print('Full source and result:',dest)
 start=[s.index(t) for t in ['-- output --','-- returned --','-- error --'] if t in s]
 print(s[min(start):] if start else '[No output/return/error sections; source retained, no world result inferred]')

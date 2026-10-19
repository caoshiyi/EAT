"""Run owned p1 program; preserve exact arena response, including failures."""
from pathlib import Path
import subprocess,sys,datetime
root=Path(__file__).resolve().parent
file=(root/sys.argv[1]).resolve()
assert file.parent==root and file.suffix=='.js'
args=['python3','tools/mc_arena.py','run','--player','p1','--timeout',sys.argv[2] if len(sys.argv)>2 else '35',str(file)]
r=subprocess.run(args,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')
(root/f'{file.stem}_{stamp}.out').write_text(r.stdout)
print(r.stdout,end='');sys.exit(r.returncode)

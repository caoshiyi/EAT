"""Compile an owned arena function body without executing it or contacting the arena."""
import pathlib,subprocess,sys
p=pathlib.Path(sys.argv[1]).resolve();root=pathlib.Path('tasks/minecraft/team/p4/iter32').resolve()
if not p.is_relative_to(root):raise SystemExit('Expected owned iter32 candidate')
r=subprocess.run(['node','-e','const fs=require("fs");new(require("vm").Script)("(async function(bot,Movements,goals){"+fs.readFileSync(process.argv[1],"utf8")+"\\n})");',str(p)],text=True,capture_output=True,timeout=8)
if r.returncode:print(r.stderr,file=sys.stderr)
else:print('syntax-only PASS:',p.name)
raise SystemExit(r.returncode)

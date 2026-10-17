"""Read arena chat monotonically; this is chat coverage, never world proof."""
import os,pathlib,re,subprocess,sys
root=pathlib.Path(os.environ['EAT_ROOT']);p=root/'tasks/minecraft/team/p4/iter18/chat_cursor.txt'
n=p.read_text().strip() if p.exists() else '7005'
if not n.isdigit(): raise SystemExit('invalid numeric cursor')
r=subprocess.run(['python3','tools/mc_arena.py','chat','--since',str(int(n)+1)],cwd=root,text=True,capture_output=True)
if r.returncode:sys.stdout.write(r.stdout);sys.stderr.write(r.stderr);raise SystemExit(r.returncode)
lines=r.stdout.splitlines(keepends=True)
shown=''.join(lines[:12])
sys.stdout.write(shown)
if len(lines)>12: print('[more unread chat retained for next call]')
ids=[int(x) for x in re.findall(r'^#(\d+) ',shown,re.M)]
if ids:p.write_text(str(max(ids))+'\n')

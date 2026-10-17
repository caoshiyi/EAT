"""Read-only arena chat cursor; no player programs or outgoing chat."""
import json,os,re,subprocess
from pathlib import Path
root=Path(os.environ['EAT_ROOT'])
out=root/'tasks/minecraft/team/execution/iter11'
cursor=out/'chat_cursor.txt'
since=int(cursor.read_text()) if cursor.exists() else 4190
r=subprocess.run(['python3','tools/mc_arena.py','chat','--since',str(since)],cwd=root,text=True,capture_output=True,timeout=15)
if r.returncode: raise RuntimeError(r.stderr or r.stdout)
lines=r.stdout.splitlines()
items=[x for x in lines if (m:=re.match(r'^#(\d+) ',x)) and int(m[1])>since]
with (out/'chat_receipts.txt').open('a') as f:
 for x in items: f.write(x+'\n')
ids=[int(re.match(r'^#(\d+) ',x)[1]) for x in items]
if ids: cursor.write_text(str(max(ids)))
print('\n'.join(items) if items else '(no new chat)')

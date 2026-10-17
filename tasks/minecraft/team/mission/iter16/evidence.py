"""Show an immutable dated return beside SEPARATE current public player status.
Never runs player programs; never infers retention from a historical success.
"""
import argparse,datetime,json,pathlib,re,subprocess,sys
ap=argparse.ArgumentParser();ap.add_argument('program',type=int);ap.add_argument('--field',action='append');a=ap.parse_args()
b=pathlib.Path(__file__).resolve().parent
rows=[json.loads(l) for l in (b/'receipt_log.jsonl').read_text().splitlines()]
r=next((x for x in reversed(rows) if x['program']==a.program),None)
if r is None:print('No saved completed return for program',a.program);sys.exit(1)
print('HISTORICAL RETURN:',r['header'])
v=r['returned'];print(json.dumps({k:v[k] for k in a.field if k in v} if a.field and isinstance(v,dict) else v,indent=2))
m=re.search(r' (p[1-4]) role=',r['header'])
print('SEPARATE CURRENT STATUS; non-atomic; does not establish cause or score:')
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
p=subprocess.run(['python3','tools/mc_arena.py','status'],text=True,capture_output=True,timeout=25)
if p.returncode:print('STATUS FAILED',p.returncode,p.stderr);sys.exit(p.returncode)
lines=p.stdout.splitlines()
for i,line in enumerate(lines):
 if m and line.startswith(m[1]+':'):
  print(start,line)
  if i+1<len(lines) and lines[i+1].startswith(' '):print(lines[i+1])
  break
else:print('PLAYER NOT FOUND; no current-state inference')
print('Status returned:',datetime.datetime.now(datetime.timezone.utc).isoformat())

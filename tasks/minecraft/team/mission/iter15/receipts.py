"""Summarize exact returned values of newly completed public p2 programs."""
import json,pathlib,re,subprocess
base=pathlib.Path(__file__).resolve().parent
p=subprocess.run(['python3','tools/mc_arena.py','programs','--player','p2','--last','8','--full'],text=True,capture_output=True,timeout=25)
(base/'source_programs_latest.txt').write_text(p.stdout+p.stderr)
if p.returncode:raise SystemExit(p.returncode)
cursor=base/'receipt_cursor.json';last=json.loads(cursor.read_text()) if cursor.exists() else 7550
current=0;header='';need=False
for line in p.stdout.splitlines():
 m=re.match(r'== #(\d+) ',line)
 if m:current=int(m[1]);header=line;need=False
 elif line=='-- returned --':need=True
 elif need:
  need=False
  if current<=last:continue
  try:r=json.loads(line)
  except json.JSONDecodeError:print('UNPARSED',header,line[:200]);continue
  if not isinstance(r,dict):print(header,r);continue
  with (base/'receipt_log.jsonl').open('a') as log:log.write(json.dumps({'header':header,'program':current,'returned':r})+'\n')
  keys=['at','issue','endingIssue','hp','food','onFire','backFull','gateClosed','rods','dead','drops','inv','hits','swung','swingRestored','entered','sealed','rodGain','lost','stock','enclosed','got']
  print(header,json.dumps({k:r[k] for k in keys if k in r},separators=(',',':')))
  last=max(last,current)
cursor.write_text(json.dumps(last))

"""Read saved canonical arena responses only; no control or success inference."""
import json,pathlib,re
b=pathlib.Path(__file__).resolve().parent
latest=json.loads((b/'observations/latest.json').read_text())
f=pathlib.Path(latest['path'])/'programs.txt'
cursor=b/'receipt_cursor.json';seen=set(json.loads(cursor.read_text())) if cursor.exists() else set()
header='';pid=None;want=False
for line in f.read_text().splitlines():
 m=re.match(r'== #(\d+) ',line)
 if m:pid=int(m[1]);header=line;want=False
 elif line=='-- returned --':want=True
 elif want:
  want=False
  if pid in seen:continue
  try:r=json.loads(line)
  except Exception:print('UNPARSED',header,line[:200]);continue
  with (b/'receipt_log.jsonl').open('a') as out:out.write(json.dumps({'program':pid,'header':header,'returned':r})+'\n')
  keys=['p','at','pos','position','dim','dimension','hp','health','food','issue','endingIssue','closed','sealed','enclosed','lost','rodBefore','rodAfter','rodPreserved','rodGain','rods','inv','inventory','cuts','steps','down','seconds','entered','portal','portalCount','frames','used','eyes','ending','stage','ok','done']
  val={k:r[k] for k in keys if k in r} if isinstance(r,dict) else r
  print(header,json.dumps(val,separators=(',',':'))[:3200]);seen.add(pid)
cursor.write_text(json.dumps(sorted(seen)))

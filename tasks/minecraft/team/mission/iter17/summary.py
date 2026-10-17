"""Compact read-only view of saved arena observations. No world actions."""
import json,re,pathlib
b=pathlib.Path(__file__).resolve().parent
receipt=json.loads((b/'observations/latest.json').read_text()); d=pathlib.Path(receipt['path'])
print('SNAPSHOT',receipt['utc'],'non-atomic; statuses fresh, returns dated')
print((d/'status.txt').read_text())
c=b/'summary_cursor.json'; seen=json.loads(c.read_text()) if c.exists() else {'chat':0,'completed':[]}
chat=(d/'chat.txt').read_text()
for line in chat.splitlines():
 m=re.match(r'#(\d+)',line)
 if m and int(m[1])>seen['chat']: print(line);seen['chat']=int(m[1])
program=(d/'programs.txt').read_text(); head='';pid=0;want=False;completed=set(seen.get('completed',[]))
keys=['p','at','pos','position','dim','dimension','hp','health','food','issue','endingIssue','closed','sealed','enclosed','lost','inv','inventory','cuts','steps','seconds','ending','stage','ok','done','attack','destroyed','retreatIssue','returnIssue','receipt','attacks','hits','minHp','damage','shots','received','gain','before','after','boss','dragonHP','minDistance','minReach','phase']
for line in program.splitlines():
 m=re.match(r'== #(\d+) ',line)
 if m:pid=int(m[1]);head=line
 elif line=='-- returned --':want=True
 elif want:
  want=False
  if pid in completed:continue
  try:r=json.loads(line)
  except Exception: print('UNPARSED',head,line[:200]);continue
  completed.add(pid)
  out={k:r[k] for k in keys if k in r} if isinstance(r,dict) else {'type':type(r).__name__}
  if isinstance(r,dict):
   out['other_keys']=[k for k in r if k not in keys]
   if 'trace' in r and isinstance(r['trace'],list):out['trace_last']=r['trace'][-3:]
  print(head,json.dumps(out,separators=(',',':'))[:2300])
seen['completed']=sorted(completed);c.write_text(json.dumps(seen))

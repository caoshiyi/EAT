"""Summarize already captured evidence, never run arena/player commands.
Cursor/state written only under knowledge/. Exact records remain available for audits.
"""
import hashlib,json,os,pathlib,re
root=pathlib.Path(os.environ['EAT_ROOT']); folder=root/'tasks/minecraft/team/knowledge'
cp=folder/'digest_cursor.json'; old=json.loads(cp.read_text()) if cp.exists() else {}; new={}
def read(k):return json.loads((folder/f'latest_{k}.json').read_text())
status=read('status');print('STATUS last-change',status['time']);new['status']=status['stdout']
if old.get('status')!=status['stdout']:
 for line in status['stdout'].splitlines():
  if line.startswith(('p1:','p2:','p3:','p4:')):print(line)
 if old.get('status'):
  before=old['status'].splitlines();after=status['stdout'].splitlines()
  for i,line in enumerate(after):
   if line.startswith('    held:') and (i>=len(before) or before[i]!=line):print('KIT',line[:700])
else:print('unchanged')
chat=read('chat')['stdout'];ids=[]
known_ids=[int(m[1]) for m in re.finditer(r'^#(\d+) ',chat,re.M)]
chat_floor=old.get('chat_id',max(known_ids,default=0)-5)
for line in chat.splitlines():
 m=re.match(r'#(\d+) ',line)
 if m:
  n=int(m[1]);ids.append(n)
  if n>chat_floor:print('CHAT',line)
new['chat_id']=max(ids,default=old.get('chat_id',0))
events=read('events')['stdout'].splitlines();new['events']=events
for line in events:
 if line not in old.get('events',events[:-2]):print('EVENT',line)
programs=read('programs')['stdout'];headers=[l for l in programs.splitlines() if l.startswith('== #')];new['headers']=headers
for line in headers:
 if line not in old.get('headers',headers[:-2]):print('PROGRAM',line)
plan=(root/'tasks/minecraft/team/PLAN.md').read_text();digest=hashlib.sha256(plan.encode()).hexdigest();new['plan_hash']=digest
if digest!=old.get('plan_hash'):
 print('PLAN CHANGED')
 for i,line in enumerate(plan.splitlines()):
  if i<5 or re.search(r'Knowledgeengineer|Knowledge engineer|knowledgeengineer|question|reviewer',line):print(line)
cp.write_text(json.dumps(new,indent=2)+'\n')

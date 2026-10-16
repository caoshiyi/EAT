"""Coordinator read-only evidence collection; never issues player programs."""
import concurrent.futures,datetime,json,os,pathlib,re,subprocess,sys
root=pathlib.Path(os.environ['EAT_ROOT']); dest=root/'tasks/minecraft/team/mission/iter6';dest.mkdir(exist_ok=True)
now=datetime.datetime.now(datetime.timezone.utc); stamp=now.strftime('%Y%m%dT%H%M%SZ')
queries={'status':['tools/mc_arena.py','status'],'programs':['tools/mc_arena.py','programs','--last','40','--full'],'chat':['tools/mc_arena.py','chat','--last','30'],'events':['tools/mc_arena.py','events','--last','15']}
if '--eval' in sys.argv:queries['eval']=['tools/eval_minecraft.py']
def run(kv):
 k,args=kv
 try:
  r=subprocess.run([sys.executable,*args],cwd=root,text=True,capture_output=True,timeout=35);return k,dict(exit=r.returncode,stdout=r.stdout,stderr=r.stderr)
 except Exception as e:return k,dict(error=repr(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=5)as pool:out=dict(pool.map(run,queries.items()))
(dest/(stamp+'.json')).write_text(json.dumps(out,indent=2));print('UTC',now.isoformat(),'raw',stamp+'.json')
statefile=dest/'cursor.json';prev=json.loads(statefile.read_text())if statefile.exists()else {'program':2081,'chat':1432,'events':[]}; state=dict(prev); seen=set(prev.get('seen',list(range(2064,2082))+[2082,2084,2085,2086,2087])); state['seen']=list(seen)
print('\n'.join(l for l in out.get('status',{}).get('stdout','').splitlines() if re.match(r'p[1-4]:',l)))
for seg in re.split(r'(?=^== #)',out.get('programs',{}).get('stdout',''),flags=re.M):
 m=re.match(r'== #(\d+)',seg)
 if not m:continue
 n=int(m[1]);state['program']=max(state['program'],n)
 if n<2064 or n in seen:continue
 seen.add(n)
 print(seg.split('\n',1)[0]); tail=seg.split('-- output --',1)[-1]if '-- output --'in seg else seg.split('-- error --',1)[-1]if '-- error --'in seg else seg.split('-- returned --',1)[-1]if '-- returned --'in seg else ''
 if not tail: print('(no output)');continue
 if len(tail)<1100:print(tail);continue
 finals=[]
 for line in tail.splitlines():
  i=line.find('{')
  if i<0:continue
  try:o=json.loads(line[i:])
  except ValueError:continue
  if isinstance(o,dict) and any(k in o for k in ('protectedEnd','issue','dead','lost','hp')):
   [o.pop(k,None) for k in ('trace','inventory','mobs','walked','path')];o.update(hull={'foot':o['hull'].get('foot'),'cells_count':len(o['hull'].get('cells',[]))}) if isinstance(o.get('hull'),dict) else None;finals.append(line[:i]+json.dumps(o,separators=(',',':')))
 print(tail[:180]+'\n[full raw saved]\n'+ ('\n'.join(finals)[-1600:]if finals else tail[-550:]))
for line in out.get('chat',{}).get('stdout','').splitlines():
 m=re.match(r'#(\d+)',line)
 if m:
  n=int(m[1]);state['chat']=max(state['chat'],n)
  if n>prev['chat']:print('CHAT',line)
events=out.get('events',{}).get('stdout','').splitlines()
for line in events:
 if prev['events'] and line not in prev['events']:print('EVENT',line)
state['events']=events;state['seen']=sorted(seen);statefile.write_text(json.dumps(state))
if 'eval'in out:print(out['eval'].get('stdout',''))
for k,v in out.items():
 if v.get('exit',1):print('QUERY_FAILED',k,v)

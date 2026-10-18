"""Read-only arena evidence collector; never invokes run or say or evaluator."""
import concurrent.futures, datetime, hashlib, json, pathlib, re, subprocess, sys
ROOT=pathlib.Path('tasks/minecraft/team/reviewer/iter22')
ROOT.mkdir(parents=True,exist_ok=True)
now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
statefile=ROOT/'collector_state.json'
state=json.loads(statefile.read_text()) if statefile.exists() else {}
commands={'status':['status'],'events':['events','--last','30'],'chat':['chat','--last','25'],'programs':['programs','--last','18','--full']}
def read(item):
 k,args=item
 try:
  r=subprocess.run([sys.executable,'tools/mc_arena.py',*args],capture_output=True,text=True,timeout=25)
  return k,{'rc':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
 except subprocess.TimeoutExpired as e:return k,{'rc':'timeout','stdout':str(e.stdout or ''),'stderr':str(e.stderr or '')}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 results=dict(pool.map(read,commands.items()))
new={}
for k,r in results.items():
 raw=r['stdout']; digest=hashlib.sha256(raw.encode()).hexdigest()
 if digest!=state.get(k):
  (ROOT/f'{now}_{k}.txt').write_text(raw)
  if r['stderr']:(ROOT/f'{now}_{k}.stderr').write_text(r['stderr'])
  new[k]=r;state[k]=digest
statefile.write_text(json.dumps(state,indent=2))
print('OBSERVED',now,'changed',','.join(new) or 'none')
for k in ['status','events','chat']:
 if k in new:
  s=new[k]['stdout']; print(k.upper(),s if k=='status' else '\n'.join(s.splitlines()[-6:]))
if 'programs' in new:
 for section in re.split(r'(?=^== #\d+ )',new['programs']['stdout'],flags=re.M):
  m=re.match(r'== #(\d+) ',section)
  if not m:continue
  ident=m.group(1); f=ROOT/f'program_{ident}.txt'
  if f.exists() and f.read_text()==section:continue
  f.write_text(section)
  print('PROGRAM',section.splitlines()[0])
  if '-- returned --' in section:print('RETURN',section.split('-- returned --',1)[1][:700])
  elif 'bot.chat(' in section:print('RELAY',section.splitlines()[1][:650])
  else:print('ENDING',section[-500:])
for k,r in results.items():
 if r['rc']!=0 or r['stderr']: print('COLLECTOR_ERROR',k,r['rc'],r['stderr'][:300])

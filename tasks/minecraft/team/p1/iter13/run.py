import argparse,datetime,json,os,pathlib,re,subprocess,time
p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--timeout',type=int,default=60);a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']).resolve();os.chdir(root)
f=pathlib.Path(a.source).resolve();owned=root/'tasks/minecraft/team/p1'
if not f.is_relative_to(owned):raise SystemExit('source must be P1-owned')
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f');out=owned/'iter13'/f'{f.stem}_{stamp}.out'
begin=time.time();r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p1','--timeout',str(a.timeout),str(f)],capture_output=True,text=True,timeout=a.timeout+20)
s=r.stdout+r.stderr;out.write_text(s)
m=re.search(r'--- returned ---\s*\n([\s\S]*?)\n--- chat',s)
try:
 result=json.loads(m[1]) if m else None
except (ValueError,TypeError):result=None
if not isinstance(result,dict):
 inline=re.findall(r'(?:U_END|LIFT_END) (\{[^\n]*\})',s)
 if inline:
  try:result=json.loads(inline[-1])
  except ValueError:pass
if isinstance(result,dict):
 shown={k:v for k,v in result.items() if k not in ['walked','combatTrace','threatTrace']}
 for k in ['walked','combatTrace','threatTrace']:
  if k in result:shown[k+'_count']=len(result[k]);shown[k+'_last']=result[k][-3:]
 print(s.split('--- output ---')[0],flush=True)
 for line in s.split('--- returned ---')[0].splitlines():
  if any(word in line for word in ['ISSUE','FAIL','RECOVERY','COMBAT']):print(line,flush=True)
 print('RETURNED_ACTUAL',json.dumps(shown),flush=True)
else:print(s,flush=True)
if '--- chat' in s:
 print(s[s.index('--- chat'):],flush=True)
record=dict(at=stamp,source=str(f.relative_to(root)),output=str(out.relative_to(root)),elapsed=round(time.time()-begin,2),rc=r.returncode,deadline=os.environ.get('CR_DEADLINE'),programs=re.findall(r'program #(\d+)',s))
with (owned/'iter13/RUNS.jsonl').open('a') as log:log.write(json.dumps(record)+'\n')
print('RECORD',json.dumps(record),flush=True)

"""Read arena CLI evidence into an owned directory, preserving failures and timestamps."""
import datetime,json,pathlib,re,subprocess,sys
root=pathlib.Path('tasks/minecraft/team/p4/iter32')
tag=sys.argv[1] if len(sys.argv)>1 else 'capture'
if not re.fullmatch(r'[A-Za-z0-9_-]+',tag):raise SystemExit('Invalid owned tag')
dest=root/(tag+'_'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ'));dest.mkdir()
manifest=[]
commands=[('live_status',['tools/mc_arena.py','status']),('sandbox_status',['tools/mc_arena.py','--sandbox','status']),('live_events',['tools/mc_arena.py','events','--last','10000']),('sandbox_events',['tools/mc_arena.py','--sandbox','events','--last','10000']),('chat',['tools/mc_arena.py','chat','--last','30']),('p2_recent',['tools/mc_arena.py','programs','--player','p2','--last','5','--full']),('p4_recent',['tools/mc_arena.py','programs','--player','p4','--last','3','--full']),('p4_sb_recent',['tools/mc_arena.py','--sandbox','programs','--player','p4','--last','3','--full'])]
if '--eval' in sys.argv:commands.append(('eval',['tools/eval_minecraft.py']))
for name,args in commands:
 started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 try:
  p=subprocess.run([sys.executable]+args,text=True,capture_output=True,timeout=40)
  raw=p.stdout+p.stderr;(dest/(name+'.txt')).write_text(raw)
  manifest.append(dict(name=name,started=started,ended=datetime.datetime.now(datetime.timezone.utc).isoformat(),rc=p.returncode,save_failed=bool(re.search(r'\bsave(?:-all)?\s+failed\b',raw,re.I)) and name=='eval'))
 except subprocess.TimeoutExpired as e:
  (dest/(name+'.txt')).write_text(str(e));manifest.append(dict(name=name,started=started,error='timeout'))
(dest/'manifest.json').write_text(json.dumps(manifest,indent=2))
# Both environments retain each individual death, including idle deaths, after arena startup.
counts={}
for env in ['live','sandbox']:
 f=dest/(env+'_events.txt')
 if not f.exists():continue
 lines=[x for x in f.read_text().splitlines() if x[:19]>='2026-10-19T09:14:44' and re.search(r'\sdeath\s',x)]
 counts[env]={'total':len(lines),'events':lines,'by_player':{p:sum('player='+p in x for x in lines) for p in ['p1','p2','p3','p4']}}
(dest/'deaths.json').write_text(json.dumps(counts,indent=2))
print(dest)
print(json.dumps(counts))
print('Read-only capture completed; rc0 is capture success, never gameplay success.')

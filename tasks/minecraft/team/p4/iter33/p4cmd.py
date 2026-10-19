"""Serialize all p4 mutations (including chat) across LIVE and sandbox via arena CLI only."""
import fcntl,pathlib,subprocess,sys,time,datetime,re,json,hashlib
root=pathlib.Path('tasks/minecraft/team/p4/iter33')
args=sys.argv[1:];sandbox=False
if args and args[0]=='--sandbox':sandbox=True;args=args[1:]
if not args or args[0] not in ['check','say','run']:raise SystemExit('usage: p4cmd.py [--sandbox] check|say TEXT|run [--timeout N] FILE')
lock=open(root/'p4_command.lock','a')
try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
except BlockingIOError:raise SystemExit('P4 caller active; refusing queued overlap')
def status(sb):
 r=subprocess.run([sys.executable,'tools/mc_arena.py']+(['--sandbox'] if sb else [])+['status'],text=True,capture_output=True,timeout=8)
 if r.returncode:
  if sb and 'the sandbox is not running' in r.stdout+r.stderr:return 'p4: sandbox not running'
  raise SystemExit('Cannot verify idle: '+r.stdout+r.stderr)
 lines=r.stdout.splitlines();line=next((x for x in lines if x.startswith('p4:')),None)
 if not line:raise SystemExit('No p4 status; refusing mutation')
 return line
lines=[status(False),status(True)]
if args[0]=='check':
 print('LIVE',lines[0]);print('SANDBOX',lines[1]);raise SystemExit(0)
if any('running program #' in x for x in lines):raise SystemExit('p4 active in one environment; refusing overlapping program: '+' | '.join(lines))
if args[0]=='run':
 candidate=pathlib.Path(args[-1])
 checked=subprocess.run([sys.executable,str(root/'syntax_check.py'),str(candidate)],text=True,capture_output=True)
 if checked.returncode:raise SystemExit('Pre-arena syntax rejection: '+checked.stderr[-1500:])
 print(checked.stdout,end='')
cmd=[sys.executable,'tools/mc_arena.py']+(['--sandbox'] if sandbox else [])+[args[0],'--player','p4']+args[1:]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run(cmd,text=True,capture_output=True)
print(r.stdout,end='');print(r.stderr,end='',file=sys.stderr)
m=re.search(r'program #(\d+) on p4:',r.stdout)
record={'started':started,'ended':datetime.datetime.now(datetime.timezone.utc).isoformat(),'environment':'SANDBOX' if sandbox else 'LIVE','player':'p4','canonical_program':int(m[1]) if m else None,'rc':r.returncode,'command':args[0],'claim':'CLI receipt only; no gameplay success inferred'}
if args[0]=='run':record.update(source=str(candidate),sha256=hashlib.sha256(candidate.read_bytes()).hexdigest())
out=root/'runs';out.mkdir(exist_ok=True)
tag=started.replace(':','').replace('-','')+'_'+record['environment']+'_'+str(record['canonical_program'])
(out/(tag+'.txt')).write_text(r.stdout+r.stderr)
(out/(tag+'.json')).write_text(json.dumps(record,indent=2))
print('CANONICAL_RECEIPT',json.dumps(record))
raise SystemExit(r.returncode)

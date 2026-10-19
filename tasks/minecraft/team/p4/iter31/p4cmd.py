"""Serialize all p4 mutations (including chat) across LIVE and sandbox via arena CLI only."""
import fcntl,pathlib,subprocess,sys,time
root=pathlib.Path('tasks/minecraft/team/p4/iter31')
args=sys.argv[1:];sandbox=False
if args and args[0]=='--sandbox':sandbox=True;args=args[1:]
if not args or args[0] not in ['check','say','run']:raise SystemExit('usage: p4cmd.py [--sandbox] check|say TEXT|run [--timeout N] FILE')
lock=open(root/'p4_command.lock','a')
fcntl.flock(lock,fcntl.LOCK_EX)
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
r=subprocess.run(cmd)
raise SystemExit(r.returncode)

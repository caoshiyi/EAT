"""Coordinated reset + immediate ready notice; only execute after explicit peer release."""
import argparse,datetime,fcntl,pathlib,re,subprocess,sys
p=argparse.ArgumentParser();p.add_argument('--receipt');p.add_argument('--execute',action='store_true');p.add_argument('--generation');p.add_argument('--release-record');a=p.parse_args()
root=pathlib.Path('tasks/minecraft/team/p4/iter28')
def message(s,g):
 copy=re.search(r'copied in ([0-9.]+) s',s);total=re.search(r'done in ([0-9.]+) s',s)
 if not copy or not total:raise SystemExit('No complete reset receipt; no READY')
 return f'{g} READY: CLIcopy{copy[1]}s/total{total[1]}s; exactcopyinstantunknown. Pre-reset live/SB snapshots and reset receipt preserved. Prior owners released all active programs/observers/results as recorded; copy replaces sandbox effects, not physical recovery. Current live assumptions may change after copy. P4 reset dependency released; no automatic follow-up reset.'
if a.receipt:
 print(message(pathlib.Path(a.receipt).read_text(),a.generation or 'DRYRUN'));raise SystemExit()
if not a.execute or not a.generation or not a.release_record:raise SystemExit('Need --execute --generation G28-N --release-record exact-peer-release-reference')
if not re.fullmatch(r'G28-\d+',a.generation):raise SystemExit('Bad generation')
lock=open(root/'p4_command.lock','a');fcntl.flock(lock,fcntl.LOCK_EX)
def call(args):return subprocess.run([sys.executable,'tools/mc_arena.py']+args,text=True,capture_output=True,timeout=120)
for sb in [False,True]:
 r=call((['--sandbox']if sb else[])+['status']);(root/(a.generation+'_auto_before_'+('sb'if sb else'live')+'.txt')).write_text(r.stdout+r.stderr)
 if r.returncode and not(sb and 'not running'in r.stdout+r.stderr):raise SystemExit('Cannot establish pre-reset status')
 if 'running program #'in r.stdout:raise SystemExit('Active program: reset refused')
(root/(a.generation+'_auto_release.txt')).write_text(datetime.datetime.now(datetime.timezone.utc).isoformat()+' '+a.release_record+'\n')
r=call(['sandbox','reset']);f=root/('reset_'+a.generation.replace('-','_')+'_auto.txt');f.write_text(r.stdout+r.stderr)
if r.returncode:raise SystemExit('Reset failed; raw '+str(f))
notice=message(r.stdout,a.generation)
# Keep own lock; do not invoke nested p4cmd lock. Check both own bodies before the chat-only arena program.
for sb in [False,True]:
 t=call((['--sandbox']if sb else[])+['status']);(root/(a.generation+'_auto_after_'+('sb'if sb else'live')+'.txt')).write_text(t.stdout+t.stderr)
 if t.returncode:raise SystemExit('Post-reset status unavailable; no READY chat')
 line=next((x for x in t.stdout.splitlines()if x.startswith('p4:')),None)
 if not line or 'running program #'in line:raise SystemExit('Own player active/unknown; no overlapping chat')
r=call(['say','--player','p4',notice]);(root/(a.generation+'_auto_ready.txt')).write_text(r.stdout+r.stderr)
print(notice);print(r.stdout);raise SystemExit(r.returncode)

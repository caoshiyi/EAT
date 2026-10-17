"""Run only p3's bounded route callers; verify every world receipt before the next."""
import argparse, datetime, json, math, os, pathlib, re, subprocess, sys
ROOT=pathlib.Path(os.environ['EAT_ROOT'])
OWN=ROOT/'tasks/minecraft/team/p3/iter13/nether'
def parse(raw):
    return json.loads(raw.split('--- returned ---',1)[1].split('--- chat',1)[0].strip())
def verify(d, expected):
    if d.get('issue') is not None or d.get('full') is not True or d.get('closed') is not True or d.get('hurt') is True or d.get('hp',0)<18:
        raise RuntimeError('FAILED_ENDING '+str({k:d.get(k) for k in ['issue','full','hp','p']}))
    if tuple(math.floor(d['p'][k]) for k in ['x','y','z'])!=tuple(expected):
        raise RuntimeError('WRONG_ACTUAL_ENDPOINT '+str(d['p']))
    if any(d.get('controls',{}).values()):raise RuntimeError('CONTROLS_NOT_RELEASED')
    return d
ap=argparse.ArgumentParser();ap.add_argument('--check-log');ap.add_argument('--expect');ap.add_argument('files',nargs='*');a=ap.parse_args()
if a.check_log:
    d=parse(pathlib.Path(a.check_log).read_text());verify(d,[int(x) for x in a.expect.split(',')]);print('RECEIPT_CHECK_PASS',flush=True)
    for label,changes in [('issue',{'issue':'SYNTHETIC_FAILURE'}),('missing_closed',{'closed':False}),('hurt',{'hurt':True}),('controls',{'controls':{'forward':True}}),('wrong_endpoint',{'p':{'x':9000,'y':65,'z':4}})]:
        bad=dict(d,**changes)
        try:verify(bad,[int(x) for x in a.expect.split(',')])
        except RuntimeError:print('REJECTED',label,flush=True)
        else:raise RuntimeError('UNSAFE_VALIDATOR_'+label)
    sys.exit()
previous_hp=None;previous_pearl=None;previous_entity=None
for arg in a.files:
    path=pathlib.Path(arg).resolve()
    if path.parent!=OWN or path.suffix!='.js':raise RuntimeError('ONLY_OWNED_ROUTE_FILES')
    source=path.read_text();m=re.search(r'global.P3LowerRoute9=(\{.*?\});',source)
    if not m:raise RuntimeError('STATIC_ROUTE_REQUIRED')
    plan=json.loads(m[1]);expected=plan['path'][-1]
    now=datetime.datetime.now(datetime.timezone.utc)
    required_seconds=30 if len(plan['path'])<=2 else 115
    if now.timestamp()+required_seconds>int(os.environ['CR_DEADLINE']):raise RuntimeError('STAGE_WILL_NOT_FIT_RUNNER_DEADLINE')
    print(now.isoformat(), 'BEGIN',path.name,'expected',expected,flush=True)
    proc=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p3','--timeout','125',str(path)],cwd=ROOT,capture_output=True,text=True,timeout=145)
    raw=proc.stdout+proc.stderr;(OWN/('batch_'+path.stem+'_'+now.strftime('%H%M%S_%f')+'.log')).write_text(raw)
    if proc.returncode:raise RuntimeError('ARENA_CALL_FAILED '+str(proc.returncode)+' '+raw[-1200:])
    d=verify(parse(raw),expected)
    if previous_entity is not None and d.get('entityId')!=previous_entity:raise RuntimeError('BODY_ENTITY_DISCONTINUITY')
    previous_entity=d.get('entityId')
    pearl=sum(i[1] for i in d.get('inv',[]) if i[0]=='ender_pearl')
    if previous_hp is not None and d['hp']<previous_hp:raise RuntimeError('HEALTH_DECREASE_AFTER_CLOSED_ENDING')
    if previous_pearl is not None and pearl<previous_pearl:raise RuntimeError('CARRIED_PEARL_DECREASE')
    previous_hp=d['hp'];previous_pearl=pearl
    print('VERIFIED',path.name,'p',d['p'],'HP',d['hp'],'FULL',d['full'],'PEARL',pearl,flush=True)

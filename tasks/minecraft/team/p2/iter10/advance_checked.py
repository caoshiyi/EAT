"""Only p2. Run already-owned route stages; require observed room before continuing."""
import argparse,datetime,json,os,pathlib,re,subprocess,time
root=pathlib.Path(os.environ['EAT_ROOT']); own=root/'tasks/minecraft/team/p2/iter10'
def parse(out):
    matches=re.findall(r'^FAST_STAGE_END (\{.*\})$',out,re.M)
    if not matches:return None
    return json.loads(matches[-1])
def can_continue(r):
    return bool(r and r.get('closed') is True and r.get('lost') is False and r.get('hp',0)>=19.99 and r.get('currentIndex',-1)>r.get('startIndex',-1) and not r.get('sharedPending'))
def run(file,timeout,path):
    result=subprocess.run(['python3','tools/mc_arena.py','run','--player','p2','--timeout',str(timeout),str(own/file)],cwd=root,text=True,capture_output=True)
    path.write_text(result.stdout+('\nSTDERR\n'+result.stderr if result.stderr else ''))
    return result.stdout,result.returncode
p=argparse.ArgumentParser();p.add_argument('--replay',action='store_true');p.add_argument('--stages',type=int,default=1);a=p.parse_args()
if a.replay:
    cases=[('safe_forward3.out',True),('safe_forward2.out',False),('forward3.out',False)]
    for name,expected in cases:
        observed=can_continue(parse((own/name).read_text()));assert observed==expected,(name,observed,expected)
    print('REPLAY_PASS actual progressed/protected, no-progress, and exposed-death records; no player command')
    raise SystemExit
if not 1<=a.stages<=3:raise SystemExit('1..3 stages only')
for n in range(a.stages):
    if time.time()+210>=float(os.environ.get('CR_DEADLINE',0)):raise SystemExit('STOP current runner deadline reserve')
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')
    text,rc=run('forward_safe.js',190,own/f'auto_{stamp}_{n}.out');r=parse(text)
    record={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stage':n,'rc':rc,'result':r,'continue':False}
    (own/'AUTO_STATE.json').write_text(json.dumps(record,indent=2));print(json.dumps(record),flush=True)
    if rc or not can_continue(r):raise SystemExit('STOP operation did not retain observed progress/health/protection')
    text,rc=run('verify_stage.js',12,own/f'auto_{stamp}_{n}_verify.out')
    matches=re.findall(r'^PHYSICAL_STAGE_VERIFY (\{.*\})$',text,re.M);v=json.loads(matches[-1]) if matches else {}
    record.update({'verification':v,'continue':rc==0 and v.get('verified') is True and v.get('index')==r.get('currentIndex')})
    (own/'AUTO_STATE.json').write_text(json.dumps(record,indent=2));print(json.dumps(record),flush=True)
    if not record['continue']:raise SystemExit('STOP fresh physical verification failed')
    if r['currentIndex']>=994:raise SystemExit('STOP actual farm route endpoint reached')

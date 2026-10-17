"""Finite LOW404 caller. Stops on semantic failure or unprotected/changed ending."""
import argparse,datetime,json,os,pathlib,subprocess,sys
p=pathlib.Path('tasks/minecraft/team/p4/iter14'); ap=argparse.ArgumentParser();ap.add_argument('--calls',type=int,default=1);a=ap.parse_args();assert 1<=a.calls<=8
for step in range(a.calls):
    now=datetime.datetime.now(datetime.timezone.utc)
    if now>=datetime.datetime(2026,10,17,12,9,tzinfo=datetime.timezone.utc):print('STOP delivery ending reserve');sys.exit(3)
    r=subprocess.run(['python3',str(p/'run.py'),str(p/'low_dest.js'),'--timeout','75','--require-success'],capture_output=True,text=True,timeout=95)
    print(r.stdout,flush=True)
    if r.stderr:print(r.stderr,flush=True)
    try: result=json.loads(r.stdout.splitlines()[0]);d=result['returned']
    except Exception as e:print('STOP missing structured receipt',str(e));sys.exit(4)
    inv=d.get('inv',[]);pearl=sum(i[1] for i in inv if i[0]=='ender_pearl')
    if r.returncode or d.get('issue') is not None or d.get('closed') is not True or d.get('hp',0)<18 or pearl!=10:
        print('STOP actual postcondition',{'exit':r.returncode,'issue':d.get('issue'),'closed':d.get('closed'),'hp':d.get('hp'),'pearl':pearl});sys.exit(5)
    if d.get('index')==404:print('LOW404 ACTUAL COMPLETE');sys.exit(0)
print('FINITE CALL BOUND COMPLETE; inspect before another call')

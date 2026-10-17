import json,os,pathlib,subprocess,sys
os.chdir(os.environ['EAT_ROOT'])
source=sys.argv[1]; repeats=int(sys.argv[2]); assert 1<=repeats<=4
for _ in range(repeats):
 r=subprocess.run(['python3','tasks/minecraft/team/p1/iter13/run.py',source,'--timeout','60'],text=True,capture_output=True,timeout=85)
 print(r.stdout+r.stderr,flush=True)
 lines=[x for x in r.stdout.splitlines() if x.startswith('RETURNED_ACTUAL ')]
 if r.returncode or not lines: raise SystemExit('STOP: no trusted result')
 state=json.loads(lines[-1].split(' ',1)[1])
 if state.get('issue') is not None or state.get('closed') is not True or state.get('hp',0)<12 or any(state.get('controls',{}).values()): raise SystemExit('STOP: unsuccessful or exposed result')
 if not any(state.get(k,0) for k in ('moves','up','down')): break

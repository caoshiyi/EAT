"""Bounded p3-only driver for verified enclosed mining operations.
Every stage is rendered/parsed, run through mc_arena as p3, then its actual result
must meet endpoint, position, health, discontinuity, and receipt postconditions.
Stops on first failure. Does NOT claim it can recover after arbitrary failure.
"""
from pathlib import Path
import json,subprocess,sys,os,math,time
root=Path(__file__).resolve().parent
if Path.cwd().resolve()!=Path(os.environ['EAT_ROOT']).resolve():raise SystemExit('run from EAT_ROOT')
if len(sys.argv)!=2:raise SystemExit('supply a manifest in p3/')
src=Path(sys.argv[1]).resolve()
if src.parent!=root:raise SystemExit('p3 manifest only')
data=json.loads(src.read_text());stages=data['stages']
if not 1<=len(stages)<=6:raise SystemExit('1..6 stages only')
start=time.monotonic()
for idx,stage in enumerate(stages):
 if time.monotonic()-start>210:raise SystemExit('batch time bound before next stage')
 kind=stage['kind'];job=stage['job'];stem=f"{src.stem}_stage{idx+1}"
 cfg=root/(stem+'.json');out=root/(stem+'.js');log=root/(stem+'.txt')
 cfg.write_text(json.dumps(job)+'\n')
 subprocess.run([sys.executable,str(root/'build_job.py'),kind,str(cfg),str(out)],check=True)
 run=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p3','--timeout','60',str(out)],text=True,capture_output=True,timeout=75)
 log.write_text(run.stdout+run.stderr);print(run.stdout,flush=True)
 if run.returncode:raise SystemExit(f'STOP stage{idx+1}: arena error; inspect actual state immediately')
 try:r=json.loads(run.stdout.split('--- returned ---\n',1)[1].split('\n--- chat',1)[0])
 except Exception:raise SystemExit(f'STOP stage{idx+1}: unparseable actual result')
 expected=job['nodes'][-1] if kind in ['flat','route'] else [job['origin'][0],job['origin'][1]+(job['layers'] if kind=='up' else -job['layers']),job['origin'][2]]
 actual=[math.floor(r['position'][axis]) for axis in ['x','y','z']]
 valid=r.get('sealed',r.get('protectedEnd'))is True and r.get('lost')is False and r.get('issue')is None and r.get('health',0)>=18 and actual==expected
 iron=sum(i[1] for i in r.get('inventory',[]) if i[0]=='raw_iron')
 if 'iron' in stage:valid=valid and iron==stage['iron']
 for name,minimum in stage.get('at_least',{}).items():
  valid=valid and sum(i[1] for i in r.get('inventory',[]) if i[0]==name)>=minimum
 if not valid:raise SystemExit(f'STOP stage{idx+1}: postcondition failed. actual={actual} iron={iron}; see {log.name}')
 print(f'VERIFIED_STAGE {idx+1}/{len(stages)} actual={actual} hp={r["health"]} iron={iron}',flush=True)
print('BATCH_COMPLETE physical stage results verified; later world state may change.',flush=True)

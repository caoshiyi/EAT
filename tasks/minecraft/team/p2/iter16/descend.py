"""Bounded reuse of qualified P2 shaft caller; inspect every receipt before resuming."""
import json, pathlib, subprocess, sys, os, time
root=pathlib.Path(os.environ['EAT_ROOT']); own=root/'tasks/minecraft/team/p2/iter16'
def valid(r,prior):
 return (r.get('issue') is None and r.get('closed') is True and r.get('lost') is False and r.get('rodAfter')==5 and r.get('hp',0)>=11.49 and r.get('p',{}).get('y',1000)<prior and abs(r['p']['x']+53.5)<.15 and abs(r['p']['z']-64.5)<.15 and not any(r.get('controls',{}).values()))
old=json.loads((own/'latest_result.json').read_text())['result']
assert valid(old,40)
assert not valid(dict(old,closed=False),40)
assert not valid(dict(old,rodAfter=4),40)
assert not valid(dict(old,hp=10),40)
assert not valid(dict(old,issue='failure'),40)
if '--check-only' in sys.argv:
 print('Receipt validator: actual success accepted; enclosure/cargo/health/failure negatives rejected.',flush=True);sys.exit()
for stage in range(int(sys.argv[1])):
 prior=old['p']['y']
 if prior<=11 or time.time()>int(os.environ['CR_DEADLINE'])-100: break
 r=subprocess.run([sys.executable,str(own/'run.py'),'dest_09_shaft_down.js','--timeout','75'],cwd=root,capture_output=True,text=True)
 (own/f'descent_batch_{time.time_ns()}.brief').write_text(r.stdout+r.stderr)
 current=json.loads((own/'latest_result.json').read_text()); old=current['result']
 print(json.dumps({'program':current['program'],'result':old}),flush=True)
 if r.returncode or not valid(old,prior):
  print('STOP: receipt failed acceptance; inspect actual state before further execution.',flush=True);sys.exit(1)

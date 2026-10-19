#!/usr/bin/env python3
"""Serialize short arena legs; inspect actual returned world state before any successor."""
import argparse,datetime,fcntl,json,os,pathlib,subprocess,sys,time
p=argparse.ArgumentParser();p.add_argument('--legs',type=int,default=2);p.add_argument('--ms',type=int,default=30000);p.add_argument('--sprint',action='store_true');p.add_argument('--pathfinder',action='store_true');p.add_argument('--tag',required=True);a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']).resolve();assert pathlib.Path.cwd().resolve()==root
base=root/'tasks/minecraft/team/p2/iter31';folder=base/a.tag;folder.mkdir(exist_ok=True)
with (base/'program.lock').open('w') as lock:
 try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
 except BlockingIOError:raise SystemExit('another p2 caller active')
 for leg in range(a.legs):
  if datetime.datetime.now(datetime.timezone.utc)>=datetime.datetime(2026,10,19,9,4,30,tzinfo=datetime.timezone.utc):break
  cfg={'x':144,'z':2241,'radius':8,'ms':a.ms,'sprint':a.sprint,'pathfinder':a.pathfinder};js=folder/f'leg{leg:02}.js';out=folder/f'leg{leg:02}.out';js.write_text('const CFG='+json.dumps(cfg)+';\n'+(base/'swim_controller.js').read_text())
  run=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p2','--timeout',str(int(a.ms/1000)+18),str(js)],capture_output=True,text=True);out.write_text(run.stdout+run.stderr)
  state=None
  try:state=json.loads(run.stdout.split('--- returned ---\n',1)[1].split('\n--- ',1)[0])
  except (ValueError,IndexError):pass
  receipt={'cli_exit':run.returncode,'raw':str(out.relative_to(root)),'state':state,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()};(folder/f'leg{leg:02}.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
  if not isinstance(state,dict):print('STOP no parsed actual ending',out,flush=True);break
  report={k:state.get(k) for k in ['at','p','hp','food','dim','reason','dead','moved','jump','eyeBlock','floor','animals','berries']};print('ACTUAL_LEG',leg,json.dumps(report),flush=True)
  (base/'voyage_current.json').write_text(json.dumps(receipt,indent=2)+'\n')
  good=run.returncode==0 and not state.get('dead') and state.get('dim')=='overworld' and state.get('hp',0)>=12 and state.get('food',0)>=8 and (state.get('jump') or state.get('ground')) and state.get('eyeBlock')=='air' and state.get('moved',0)>=5 and state.get('reason')=='budget'
  if not good:print('STOP successor precondition absent',flush=True);break

"""Capture dated final evidence via arena/evaluator CLIs only; --smoke is one status read.
This does not interpret successful exit codes as successful Minecraft operations.
"""
import argparse,datetime,json,pathlib,subprocess,sys
ap=argparse.ArgumentParser();ap.add_argument('--smoke',action='store_true');args=ap.parse_args()
root=pathlib.Path('tasks/minecraft/team/p4/iter31');started=datetime.datetime.now(datetime.timezone.utc)
folder=root/(('smoke_' if args.smoke else 'closure_')+started.strftime('%Y%m%dT%H%M%SZ'));folder.mkdir(exist_ok=False)
steps=[('LIVE_STATUS',[sys.executable,'tools/mc_arena.py','status'],15)] if args.smoke else [
 ('P4_FINAL_AUDIT',[sys.executable,str(root/'p4cmd.py'),'run','--timeout','10',str(root/'retained_pod_audit.js')],30),
 ('EVAL_CLOSURE',[sys.executable,'tools/eval_minecraft.py'],30),
 ('FINAL_DEATHS',[sys.executable,str(root/'audit_deaths.py'),'--output',str(folder.relative_to(root)/'FINAL_DEATHS.json')],30),
 ('LIVE_STATUS',[sys.executable,'tools/mc_arena.py','status'],15),
 ('SB_STATUS',[sys.executable,'tools/mc_arena.py','--sandbox','status'],15),
 ('P2_FINAL_RECORDS',[sys.executable,'tools/mc_arena.py','programs','--player','p2','--last','3','--full'],20)]
manifest={'mode':'smoke' if args.smoke else 'closure','started_utc':started.isoformat(),'evidence_limit':'Dated CLI observations; inspect actual postconditions and save failures. Events include idle deaths.','steps':[]}
for name,cmd,timeout in steps:
 at=datetime.datetime.now(datetime.timezone.utc).isoformat()
 try:
  r=subprocess.run(cmd,text=True,capture_output=True,timeout=timeout)
  rc,out,err=r.returncode,r.stdout,r.stderr
 except subprocess.TimeoutExpired as e:
  rc,out,err=124,str(e.stdout or ''),str(e.stderr or '')+'\nCAPTURE_TIMEOUT'
 (folder/(name+'.txt')).write_text(out)
 (folder/(name+'.stderr')).write_text(err)
 manifest['steps'].append({'name':name,'started_utc':at,'finished_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'returncode':rc,'stdout':str(folder/(name+'.txt')),'stderr':str(folder/(name+'.stderr'))})
 print(name,'rc='+str(rc),flush=True)
manifest['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
(folder/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('CAPTURE',folder,flush=True)
if any(s['returncode'] for s in manifest['steps']):sys.exit(1)

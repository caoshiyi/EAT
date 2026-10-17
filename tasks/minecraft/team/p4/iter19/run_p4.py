"""Run ONLY p4, preserve raw+timestamped metadata, print ending before analysis.
No retries; nonzero/timeout/incomplete results require inspection and reconciliation.
"""
import argparse,datetime,json,os,pathlib,subprocess,sys,time
root=pathlib.Path(os.environ['EAT_ROOT']).resolve()
owned=(root/'tasks/minecraft/team/p4').resolve()
a=argparse.ArgumentParser();a.add_argument('program');a.add_argument('--timeout',type=int,default=60);a.add_argument('--label');v=a.parse_args()
program=pathlib.Path(v.program).resolve()
if not program.is_relative_to(owned) or not program.is_file():a.error('program must be a real p4-owned file')
if not 1<=v.timeout<=240:a.error('choose bounded timeout 1..240 seconds')
label=v.label or program.stem
if '/' in label or label in ['.','..']:a.error('label must be a filename stem')
out=owned/'iter19'/f'{label}.out';meta=out.with_suffix('.meta.json');started=datetime.datetime.now(datetime.timezone.utc);t=time.monotonic()
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p4','--timeout',str(v.timeout),str(program)],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
ended=datetime.datetime.now(datetime.timezone.utc);out.write_text(r.stdout)
m={'player':'p4','program':str(program.relative_to(root)),'start_utc':started.isoformat(),'read_end_utc':ended.isoformat(),'wall_seconds':round(time.monotonic()-t,3),'arena_timeout_seconds':v.timeout,'cli_returncode':r.returncode,'raw_output':str(out.relative_to(root))}
try:
 text=r.stdout.split('--- returned ---\n',1)[1].split('\n--- chat',1)[0];d=json.loads(text)
except (IndexError,json.JSONDecodeError):d=None
m['completed_json_return']=isinstance(d,dict)
meta.write_text(json.dumps(m,indent=2))
print(json.dumps(m,indent=1),flush=True)
if not isinstance(d,dict):
 print(r.stdout);print('NO COMPLETE JSON ENDING: reconcile body before dependent work');raise SystemExit(r.returncode or 2)
out.with_suffix('.json').write_text(json.dumps(d,indent=2))
subprocess.run([sys.executable,str(owned/'iter19/read_result.py'),str(out)],cwd=root,check=True)
# Actual returned flags, not a prediction or safety certification.
flags={k:d[k] for k in ['issue','endingIssue','retreatIssue','lost','closed','hp','ground','controls'] if k in d}
print('ACTUAL_ENDING',json.dumps(flags));print('RAW',out)
raise SystemExit(r.returncode)

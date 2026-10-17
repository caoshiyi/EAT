"""Compile one owned JS program before dispatch; preserve raw arena receipt."""
import argparse, os, pathlib, subprocess, sys, json, datetime, re
root=pathlib.Path(os.environ['EAT_ROOT']); owned=root/'tasks/minecraft/team/p2/iter15'
a=argparse.ArgumentParser();a.add_argument('name');a.add_argument('--timeout',type=int,default=60);a.add_argument('--check-only',action='store_true');v=a.parse_args()
p=(owned/v.name).resolve()
if not p.is_relative_to(owned.resolve()) or p.suffix!='.js':raise SystemExit('owned JS only')
if p.name.endswith('.inc.js') or p.name=='common_hand.js' or p.stem.endswith('_historical_source'):raise SystemExit('Library only: compose an explicit action before dispatch')
check=owned/'.syntax_check.js'
check.write_text('async function arena(bot, Movements, goals) {\n'+p.read_text()+'\n}')
r=subprocess.run(['node','--check',str(check)],cwd=root,capture_output=True,text=True)
if r.returncode:print(r.stderr);raise SystemExit(r.returncode)
if v.check_only:print('Syntax PASS (not dispatched): '+v.name);raise SystemExit(0)
r=subprocess.run(['python3','tools/mc_arena.py','run','--player','p2','--timeout',str(v.timeout),str(p)],cwd=root,capture_output=True,text=True)
raw=r.stdout+r.stderr
p.with_suffix('.out').write_text(raw)
with (owned/'receipts.jsonl').open('a') as f:f.write(json.dumps({'file':v.name,'raw':raw})+'\n')
try:
 before,after=raw.split('--- returned ---\n',1)
 value,tail=after.split('\n--- ',1)
 obj=json.loads(value)
 if isinstance(obj,dict) and ('p' in obj) and ('hp' in obj):
  match=re.search(r'program #(\d+)',raw)
  (owned/'latest_result.json').write_text(json.dumps({'source':v.name,'program':int(match.group(1)) if match else None,'observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'result':obj},indent=2))
 print(before.rstrip());print('RETURN',json.dumps(obj,separators=(',',':')));print('--- '+tail)
except (ValueError,json.JSONDecodeError):print(raw)
sys.exit(r.returncode)

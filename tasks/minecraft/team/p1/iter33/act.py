"""P1-only arena caller. Syntax check async bodies; preserve exact CLI receipts, never infer world success."""
import argparse, datetime, hashlib, json, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('file');p.add_argument('--timeout',type=int,default=30);p.add_argument('--sandbox',action='store_true');p.add_argument('--check',action='store_true');a=p.parse_args()
root=pathlib.Path(__file__).resolve().parent
src=pathlib.Path(a.file).resolve()
if not src.is_relative_to(root) or src.suffix!='.js': raise SystemExit('owned iter33 JavaScript only')
code=src.read_text();check=subprocess.run(['node','--check'],input='async function p1_program(bot) {\n'+code+'\n}\n',text=True,capture_output=True)
if check.returncode: print(check.stdout+check.stderr);raise SystemExit(check.returncode)
if a.check: print('SYNTAX_OK',src.name);raise SystemExit(0)
start=datetime.datetime.now(datetime.timezone.utc);stamp=start.strftime('%Y%m%dT%H%M%S%fZ');base=root/(src.stem+('_SB' if a.sandbox else '_LIVE')+'_'+stamp)
cmd=['python3','tools/mc_arena.py']+(['--sandbox'] if a.sandbox else [])+['run','--player','p1','--timeout',str(a.timeout),str(src)]
r=subprocess.run(cmd,text=True,capture_output=True);raw=r.stdout+r.stderr;base.with_suffix('.txt').write_text(raw)
m=re.search(r'program #(\d+) on p1:',raw)
meta={'source':str(src),'sha256':hashlib.sha256(code.encode()).hexdigest(),'environment':'sandbox' if a.sandbox else 'live','player':'p1','canonical_id':int(m.group(1)) if m else None,'start':start.isoformat(),'end':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cli_rc':r.returncode,'raw':str(base.with_suffix('.txt')),'world_success':'NOT_INFERRED'}
base.with_suffix('.json').write_text(json.dumps(meta,indent=2)+'\n');print(raw,end='');print('RECEIPT',base.with_suffix('.json'));raise SystemExit(r.returncode)

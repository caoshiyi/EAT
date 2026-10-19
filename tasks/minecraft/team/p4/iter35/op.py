"""P4-only syntax-checked execution and canonical receipt capture; no reset support."""
import argparse, datetime, json, pathlib, re, subprocess
p=argparse.ArgumentParser();p.add_argument('--sandbox',action='store_true');p.add_argument('file',type=pathlib.Path);p.add_argument('--timeout',type=int,default=60);a=p.parse_args()
base=pathlib.Path('tasks/minecraft/team/p4/iter35');a.file=a.file.resolve()
if base.resolve() not in a.file.parents: p.error('only own iter35 source files')
if 'PRACTICE' in a.file.name and not a.sandbox: p.error('PRACTICE source requires --sandbox; no arena run')
check=subprocess.run(['node','--check'],input='async function operation(bot, Movements, goals) {\n'+a.file.read_text()+'\n}',text=True,capture_output=True)
if check.returncode: raise SystemExit(check.stderr)
start=datetime.datetime.now(datetime.timezone.utc).isoformat();tag=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f');raw=base/(a.file.stem+'_'+tag+'.txt')
arena=['python3','tools/mc_arena.py','run','--player','p4','--timeout',str(a.timeout)]
if a.sandbox: arena.insert(2,'--sandbox')
arena.append(str(a.file))
r=subprocess.run(arena,text=True,capture_output=True)
raw.write_text(r.stdout+r.stderr);ids=re.findall(r'program #(\d+) on p4',r.stdout)
meta={'environment':'sandbox' if a.sandbox else 'live','started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'file':str(a.file),'raw':str(raw),'cli_rc':r.returncode,'program_ids':ids,'world_success':'inspect raw and world; not inferred'}
raw.with_suffix('.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta));print('\n'.join(l[:700] for l in r.stdout.splitlines() if l.startswith(('FAILURE','RECOVERY_FAILURE','SEAL_FAILURE','DOWN_FAILURE','RETURN_FAILURE','--- p4 now:'))));raise SystemExit(r.returncode)

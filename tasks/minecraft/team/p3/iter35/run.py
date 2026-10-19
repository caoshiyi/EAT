"""Compose owned p3 core+body, syntax check, execute exactly one arena program, retain raw receipt."""
from pathlib import Path
import sys,subprocess,datetime,hashlib,json
root=Path.cwd(); owned=root/'tasks/minecraft/team/p3/iter35'
body=(owned/sys.argv[1]).resolve()
if not body.is_relative_to(owned) or body.suffix!='.js':raise SystemExit('owned js required')
source=(owned/'travel_core.js').read_text()+'\n'+body.read_text()
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S_%f')
name=body.stem+'_'+stamp; program=owned/(name+'.js'); receipt=owned/(name+'.txt')
syntax=subprocess.run(['node','-e',"let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{new (Object.getPrototypeOf(async function(){}).constructor)('bot','Movements','goals',s);});"],input=source,text=True,capture_output=True)
if syntax.returncode:print(syntax.stderr);raise SystemExit(syntax.returncode)
program.write_text(source)
meta={'player':'p3','environment':'live','source':program.name,'sha256':hashlib.sha256(source.encode()).hexdigest()}
(owned/(name+'.json')).write_text(json.dumps(meta,indent=2)+'\n')
p=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p3','--timeout',sys.argv[2] if len(sys.argv)>2 else '60',str(program.relative_to(root))],text=True,capture_output=True)
receipt.write_text(p.stdout+p.stderr);print('RECEIPT',receipt.relative_to(root));print(p.stdout+p.stderr)
raise SystemExit(p.returncode)

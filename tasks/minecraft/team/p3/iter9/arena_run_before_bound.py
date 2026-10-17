"""Own p3 only: preserve full arena output and print a bounded, explicit summary."""
import argparse, json, os, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('program');p.add_argument('log');p.add_argument('--timeout',type=int,default=60);a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']); prog=(root/a.program).resolve(); log=(root/a.log).resolve(); own=(root/'tasks/minecraft/team/p3').resolve()
if not prog.is_relative_to(own) or not log.is_relative_to(own):sys.exit('program and log must be owned p3 paths')
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p3','--timeout',str(a.timeout),str(prog)],cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
log.write_text(r.stdout);print(r.stdout.splitlines()[0] if r.stdout else '(empty arena output)');print('RAW',log.relative_to(root))
out=r.stdout.split('--- output ---\n',1)[-1].split('--- returned ---',1)[0]
if out.strip()!='(nothing logged)':print('OUTPUT',out[:6000], ' [truncated; see RAW]' if len(out)>6000 else '')
try:
 s=r.stdout.split('--- returned ---\n',1)[1].lstrip(); result,_=json.JSONDecoder().raw_decode(s)
 if isinstance(result,dict):
  skip={'trace','cells','rows','up','fullfaces','inventory','controls','faces','logs','resources','mobs','table','floor'}
  print(json.dumps({k:v for k,v in result.items() if k not in skip},separators=(',',':')))
  if 'inventory' in result:print('INVENTORY',json.dumps(result['inventory'],separators=(',',':')))
  if result.get('trace'):print('TRACE_ISSUES',json.dumps([x for x in result['trace'] if 'step' not in x],separators=(',',':')))
 else:print(json.dumps(result))
except (IndexError,ValueError):print('UNPARSED',r.stdout[-5000:])
if '--- chat since' in r.stdout:print('CHAT_AND_END',r.stdout.split('--- chat since',1)[1])
sys.exit(r.returncode)

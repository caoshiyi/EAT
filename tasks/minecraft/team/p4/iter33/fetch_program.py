"""Fetch an exact current-iteration arena program ID via public CLI; never guess latest."""
import sys,subprocess,pathlib,re,datetime,json
args=sys.argv[1:];sb='--sandbox' in args;args=[a for a in args if a!='--sandbox']
if len(args)!=2 or args[0] not in ['p2','p4'] or not args[1].isdigit():raise SystemExit('usage: fetch_program.py [--sandbox] p2|p4 ID')
player,pid=args[0],int(args[1]);minimum=347 if sb else 12181
if pid<minimum:raise SystemExit('Only iter33 IDs accepted; historical evidence requires explicit separate source selection')
root=pathlib.Path('tasks/minecraft/team/p4/iter33');stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ');cmd=[sys.executable,'tools/mc_arena.py']+(['--sandbox'] if sb else [])+['programs','--player',player,'--last','8','--full'];r=subprocess.run(cmd,text=True,capture_output=True,timeout=15)
if r.returncode:raise SystemExit(r.stdout+r.stderr)
chunks=re.split(r'(?m)(?=^== #)',r.stdout);selected=[c for c in chunks if re.match(r'^== #'+str(pid)+r'\s',c)]
if len(selected)!=1:raise SystemExit('Exact ID not among last8; no file falsely labeled. Explicit larger canonical capture needed.')
raw=selected[0];env='SB' if sb else 'LIVE';dest=root/(env+'_'+str(pid)+'_'+stamp+'.txt');dest.write_text(raw);print(dest);print(raw.splitlines()[0]);print('complete_output',bool(re.search(r'(?m)^-- output --$',raw)));print('terminal_sections',re.findall(r'(?m)^-- (returned|error) --$',raw))

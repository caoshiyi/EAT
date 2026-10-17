import pathlib,subprocess,json,sys,datetime
root=pathlib.Path('tasks/minecraft/team/p3/iter14')
def result(s):
    for m in ['--- returned ---\n','-- returned --\n']:
        if m in s:
            return json.JSONDecoder().raw_decode(s.split(m,1)[1].lstrip())[0]
    raise ValueError('missing actual returned state')
if sys.argv[1:] == ['--test']:
    r=result((root/'approach_east.out').read_text());assert r['full'] and r['closed'] and r['hp']==20 and r['p']['y']==59;print('parser accepted actual approach, issue=',r['issue']);sys.exit()
for name in sys.argv[1:]:
    p=root/name
    t=datetime.datetime.now(datetime.timezone.utc).isoformat();print('START',name,t,flush=True)
    cp=subprocess.run(['python3','tools/mc_arena.py','run','--player','p3','--timeout','120',str(p)],capture_output=True,text=True)
    p.with_suffix('.out').write_text(cp.stdout+cp.stderr)
    r=result(cp.stdout); print('ACTUAL',name,json.dumps(r),flush=True)
    if cp.returncode or r.get('issue') or not r.get('full') or not r.get('closed') or r.get('hp',0)<18: raise SystemExit('STOP batch actual failure')

import sys,subprocess,datetime,pathlib
p=pathlib.Path(__file__).resolve().parent
name=sys.argv[1];f=p/name
sandbox=len(sys.argv)>3 and sys.argv[3]=='sb'
if not sandbox and name in {'shield_one.js','shield_still.js','surface_two.js','surface_one_east.js','surface_ray_one.js','surface_two_native.js'}:
    raise SystemExit('RETIRED LIVE prototype: exposed retreat failed in sandbox; no world program submitted')
r=subprocess.run([sys.executable,'tools/mc_arena.py',*(['--sandbox'] if sandbox else []),'run','--player','p2','--timeout',sys.argv[2] if len(sys.argv)>2 else '60',str(f)],capture_output=True,text=True)
out=r.stdout+r.stderr
(p/(('SB_' if sandbox else '')+f.stem+'_'+datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')+'.out')).write_text(out)
print(out if r.returncode else '\n'.join(line for line in out.splitlines() if line.startswith(('program #','SOURCE ','ACTUAL ','TARGET ','GRID ','ROOT_EFFECT ','ENDING ','FAIL ','SEAL_FAIL ','--- chat','p1:','p2:','p3:','p4:','--- p2','Error','BERRY','DONATION','HEAL','STATE','RESULT','WINDOW','PLANT','EAT','MOVED','DELIVERY'))));sys.exit(r.returncode)

import sys,subprocess,datetime,pathlib
p=pathlib.Path(__file__).resolve().parent
name=sys.argv[1];f=p/name
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p2','--timeout',sys.argv[2] if len(sys.argv)>2 else '60',str(f)],capture_output=True,text=True)
out=r.stdout+r.stderr
(p/(f.stem+'_'+datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')+'.out')).write_text(out)
print(out if r.returncode else '\n'.join(line for line in out.splitlines() if line.startswith(('program #','SOURCE ','ACTUAL ','TARGET ','GRID ','ROOT_EFFECT ','ENDING ','FAIL ','SEAL_FAIL ','--- chat','p1:','p2:','p3:','p4:','--- p2','Error','BERRY','DONATION','HEAL','STATE','RESULT','WINDOW','PLANT','EAT','MOVED','DELIVERY'))));sys.exit(r.returncode)

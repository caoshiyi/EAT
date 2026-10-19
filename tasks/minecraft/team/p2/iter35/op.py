import sys,subprocess,pathlib,datetime
p=pathlib.Path(__file__).resolve().parent
f=p/sys.argv[1]
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p2','--timeout',sys.argv[2] if len(sys.argv)>2 else '60',str(f)],capture_output=True,text=True)
s=r.stdout+r.stderr
out=p/(f.stem+'_'+datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')+'.out');out.write_text(s)
print(str(out)); print('\n'.join(x for x in s.splitlines() if x.startswith(('program #','SOURCE ','FAIL','ENDING ','ACTUAL_END ','ROUTE_WORLD ','--- p2','Error','DELIVERY','RESULT','SUCCESS','RETURN'))));sys.exit(r.returncode)

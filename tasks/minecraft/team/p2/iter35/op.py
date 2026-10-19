import sys,subprocess,pathlib,datetime,json
p=pathlib.Path(__file__).resolve().parent
f=p/sys.argv[1]
r=subprocess.run([sys.executable,'tools/mc_arena.py','run','--player','p2','--timeout',sys.argv[2] if len(sys.argv)>2 else '60',str(f)],capture_output=True,text=True)
s=r.stdout+r.stderr
out=p/(f.stem+'_'+datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')+'.out');out.write_text(s)
print(str(out))
for line in s.splitlines():
 if line.startswith(('program #','FAIL','Error','--- p2','DELIVERY','RESULT','SUCCESS','RETURN')):print(line)
 ends=[x for x in s.splitlines() if x.startswith(('ENDING ','ACTUAL_END '))]
if ends:
 try:
  x=json.loads(ends[-1].split(' ',1)[1]);print('STATE',json.dumps({k:x.get(k) for k in ['at','p','hp','food','dim','ground','controls','goalPresent']}));print('INV',x.get('inv'))
 except Exception:print(ends[-1])
sys.exit(r.returncode)

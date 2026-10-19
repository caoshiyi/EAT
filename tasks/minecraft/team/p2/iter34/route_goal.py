import sys,pathlib,subprocess,json,math
p=pathlib.Path(__file__).resolve().parent
x,y,z=map(int,sys.argv[1:4]); limit=int(sys.argv[4]) if len(sys.argv)>4 else 4
for attempt in range(limit):
    r=subprocess.run([sys.executable,str(p/'route.py'),str(x),str(y),str(z)],capture_output=True,text=True)
    print(r.stdout+r.stderr,flush=True)
    endings=[]
    for line in r.stdout.splitlines():
        if line.startswith('ENDING '):
            try: endings.append(json.loads(line[7:]))
            except json.JSONDecodeError: pass
    if r.returncode or not endings:
        raise SystemExit('STOP: no verified ending; inspect raw before further action')
    e=endings[-1]; q=e['p']
    if (math.floor(q['x']),math.floor(q['y']),math.floor(q['z']))==(x,y,z):
        print('VERIFIED_GOAL',q,flush=True);break
    if e.get('reason')!='budget' or not e.get('steps'):
        raise SystemExit('STOP: world did not progress to target; no automatic retry')
else:
    raise SystemExit('STOP: bounded route-call limit, inspect state')

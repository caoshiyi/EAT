import sys,subprocess,time,pathlib,datetime
root=pathlib.Path(__file__).resolve().parent
message=sys.argv[1]; start=time.monotonic(); trace=[]
while time.monotonic()-start<90:
 r=subprocess.run([sys.executable,'tools/mc_arena.py','status'],capture_output=True,text=True)
 lines=r.stdout.splitlines(); own=next((i for i,x in enumerate(lines) if x.startswith('p2:')),None)
 if own is None:raise SystemExit('No p2 status; message unsent')
 header=lines[own]
 if 'running program' in header:time.sleep(2);continue
 block='\n'.join(lines[own:own+2]);trace.append(block)
 if 'alive' not in header or 'sweet_berries x12' not in block:raise SystemExit('Precondition changed; message unsent: '+block)
 r=subprocess.run([sys.executable,'tools/mc_arena.py','say','--player','p2',message],capture_output=True,text=True)
 trace.append(r.stdout+r.stderr);out=root/('queued_chat_'+datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')+'.out');out.write_text('\n'.join(trace));print(r.stdout+r.stderr);raise SystemExit(r.returncode)
raise SystemExit('90s deadline; message unsent')

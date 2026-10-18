"""Owned read-only arena recorder. No programs, player inputs, server files, or shell calls."""
import os,sys,subprocess,time,json,datetime,pathlib
root=pathlib.Path(os.environ['EAT_ROOT']); out=root/'tasks/minecraft/team/p4/iter20/watch.jsonl'
seconds=float(sys.argv[1]) if len(sys.argv)>1 else 0
end=time.monotonic()+seconds; previous={}
while True:
 for key,args in [('status',['status']),('chat',['chat','--last','12']),('events',['events','--last','5'])]:
  r=subprocess.run(['/usr/bin/python3','tools/mc_arena.py',*args],cwd=root,capture_output=True,text=True,timeout=15)
  value=r.stdout+r.stderr
  if previous.get(key)!=value:
   record={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':key,'code':r.returncode,'text':value}
   with out.open('a') as f:f.write(json.dumps(record)+'\n')
   print(json.dumps(record),flush=True);previous[key]=value
 if time.monotonic()>=end:break
 time.sleep(min(10,max(0,end-time.monotonic())))

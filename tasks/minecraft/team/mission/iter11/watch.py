import argparse,datetime,hashlib,json,os,pathlib,subprocess,time
ap=argparse.ArgumentParser();ap.add_argument('--once',action='store_true');a=ap.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']); dest=root/'tasks/minecraft/team/mission/iter11/snapshots';dest.mkdir(exist_ok=True)
deadline=int(os.environ['CR_DEADLINE']);previous={}
while True:
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%H%M%S')
 for name,args in [('status',['status']),('programs',['programs','--last','12','--full']),('chat',['chat','--last','24']),('events',['events','--last','12'])]:
  try:
   r=subprocess.run(['python3','tools/mc_arena.py',*args],cwd=root,text=True,capture_output=True,timeout=20)
   value=r.stdout+'\nSTDERR:'+r.stderr if r.stderr else r.stdout
   digest=hashlib.sha256(value.encode()).hexdigest()
   if digest!=previous.get(name):
    (dest/(stamp+'_'+name+'.txt')).write_text(value);(dest/('latest_'+name+'.txt')).write_text(value);previous[name]=digest
   with (dest/'health.jsonl').open('a') as f:f.write(json.dumps(dict(utc=stamp,kind=name,exit=r.returncode,bytes=len(value)))+'\n')
  except Exception as e:
   with (dest/'health.jsonl').open('a') as f:f.write(json.dumps(dict(utc=stamp,kind=name,error=str(e)))+'\n')
 if a.once or time.time()>=deadline:break
 time.sleep(min(25,max(0,deadline-time.time())))

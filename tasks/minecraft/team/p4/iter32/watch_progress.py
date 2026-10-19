"""Bounded read-only arena monitor; preserved raws are evidence, summaries are navigation aids."""
import datetime,json,pathlib,re,subprocess,sys,time
root=pathlib.Path('tasks/minecraft/team/p4/iter32');duration=min(45,max(1,int(sys.argv[1]) if len(sys.argv)>1 else 30))
sandbox='--sandbox' in sys.argv[2:];env='SANDBOX' if sandbox else 'LIVE'
dest=root/('watch_'+env+'_'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ'));dest.mkdir()
start=time.monotonic();last_p2='';last_record='';manifest=[]
while time.monotonic()-start<duration:
 at=datetime.datetime.now(datetime.timezone.utc).isoformat();i=len(manifest);entry={'at':at,'environment':env}
 for name,args in [('status',['status']),('chat',['chat','--last','8']),('p2',['programs','--player','p2','--last','1','--full'])]:
  p=subprocess.run([sys.executable,'tools/mc_arena.py']+(['--sandbox'] if sandbox else [])+args,text=True,capture_output=True,timeout=8);raw=p.stdout+p.stderr;(dest/f'{i}_{name}.txt').write_text(raw);entry[name+'_rc']=p.returncode
  if name=='status':
   line=next((x for x in raw.splitlines() if x.startswith('p2:')),'MISSING P2')
   if line!=last_p2:print(env,at,line,flush=True);last_p2=line
  if name=='p2':
   header=raw.splitlines()[0] if raw else 'EMPTY'
   if header!=last_record:
    print('COMPLETED_RECORD',header,flush=True);last_record=header
    out=raw.split('-- output --')[-1]
    for line in out.splitlines():
     if line.startswith(('SOURCE ','ENDING_KIND ','WET_EFFECT ','FAILURE ','RECOVERY_FAILURE ')):
      match=re.search(r'\{.*\}',line)
      if match:
       try:
        d=json.loads(match[0]);print(line.split(' ',1)[0],json.dumps({k:d.get(k) for k in ['at','p','hp','food','kind','wet']}),'full',sum(x.get('full',False) for x in d.get('faces',[])),flush=True)
       except json.JSONDecodeError:print(line[:220],flush=True)
      else:print(line[:220],flush=True)
 manifest.append(entry)
 if time.monotonic()-start+10>=duration:break
 time.sleep(10)
(dest/'manifest.json').write_text(json.dumps(manifest,indent=2));print('READ_ONLY_CAPTURE',dest,flush=True)

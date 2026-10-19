"""Bounded observer poll: read arena records; save changed snapshots only."""
import datetime,json,re,subprocess,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent
p=root/'cursor.json'; old=json.loads(p.read_text()) if p.exists() else {}; new={}
print(datetime.datetime.now(datetime.timezone.utc).isoformat())
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
for kind,args in [('status',[]),('chat',['--last','18']),('events',['--last','12']),('programs',['--last','6','--full'])]:
 r=subprocess.run(['python3','tools/mc_arena.py',kind,*args],text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=40)
 s=r.stdout; digest=hashlib.sha256(s.encode()).hexdigest();new[kind]=digest
 if digest==old.get(kind):continue
 f=root/(stamp+'_'+kind+'.txt');f.write_text(s)
 if kind=='status':
  owner=None; inv={}
  for line in s.splitlines():
   if not line.startswith('    '):
    print(line);owner=line.split(':',1)[0]
   elif owner:
    inv[owner]=line.strip()
    if old.get('inventories',{}).get(owner)!=line.strip(): print(owner+' inventory changed: '+line.strip())
  new['inventories']=inv
 elif kind in ('chat','events'):
  lines=s.splitlines();seen=set(old.get(kind+'_lines',[]));print('\n'.join(l for l in lines if l not in seen))
 elif kind=='programs':
  headers=re.findall(r'^== #.*',s,re.M); seen=set(old.get('program_headers',[]));print('\n'.join(h for h in headers if h not in seen));new['program_headers']=headers
  print('receipts',str(f))
 if kind in ('chat','events'):new[kind+'_lines']=s.splitlines()
for k,v in old.items():new.setdefault(k,v)
p.write_text(json.dumps(new))

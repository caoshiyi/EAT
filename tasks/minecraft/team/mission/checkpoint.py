"""Read-only arena/evaluator evidence collector. Never runs a player program."""
import argparse, datetime, json, os, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('--status-only',action='store_true');p.add_argument('--eval',action='store_true');p.add_argument('--compact',action='store_true');a=p.parse_args()
root=pathlib.Path(os.environ['EAT_ROOT']);dest=root/'tasks/minecraft/team/mission/checkpoints';dest.mkdir(exist_ok=True)
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ'); out={}
queries={'status':['tools/mc_arena.py','status']}
if not a.status_only: queries.update(events=['tools/mc_arena.py','events','--last','12'],programs=['tools/mc_arena.py','programs','--last','8','--full'],chat=['tools/mc_arena.py','chat','--last','12'])
if a.eval:queries['eval']=['tools/eval_minecraft.py']
for key,args in queries.items():
 try:
  r=subprocess.run([sys.executable,*args],cwd=root,text=True,capture_output=True,timeout=35)
  out[key]={'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
 except Exception as e:out[key]={'error':repr(e)}
path=dest/(stamp+'.json');path.write_text(json.dumps(out,indent=2));print('saved',path.relative_to(root))
for k in (() if a.compact else ('status','events','eval')):
 if k in out:print(k,json.dumps(out[k]))
if 'programs'in out:
 s=out['programs'].get('stdout','');
 if not a.compact:print('program_headers',[x for x in s.splitlines() if x.startswith('== #')]);print('program_bytes',len(s))
if 'chat'in out and not a.compact:print('chat_tail',out['chat'].get('stdout','')[-2600:])
if a.compact:
 prevfile=dest/'LAST_REVIEWED_ID';prev=int(prevfile.read_text())if prevfile.exists()else 1974;latest=prev
 for seg in re.split(r'(?=^== #)',out.get('programs',{}).get('stdout',''),flags=re.M):
  match=re.match(r'== #(\d+)',seg)
  if not match:continue
  number=int(match[1]);latest=max(number,latest)
  if number<=prev:continue
  print(seg.split('\n',1)[0])
  tail=seg.split('-- output --',1)[-1]if '-- output --'in seg else seg.split('-- error --',1)[-1]if '-- error --'in seg else '(no output)'
  finals=[]
  for ln in tail.splitlines():
   start=ln.find('{')
   if start<0:continue
   try:obj=json.loads(ln[start:])
   except (ValueError,TypeError):continue
   if isinstance(obj,dict) and any(k in obj for k in ('protectedEnd','issue','dead','lost','hp')):
    clean={k:v for k,v in obj.items()if k!='trace'}
    if 'trace'in obj:clean['trace_length']=len(obj['trace'])
    finals.append(ln[:start]+json.dumps(clean,separators=(',',':')))
  if len(tail)>1200 and finals:print(tail[:300]+'\n[... full output saved ...]\n'+'\n'.join(finals))
  else:print(tail if len(tail)<=1200 else tail[:500]+'\n[... full output saved ...]\n'+tail[-700:])
 prevfile.write_text(str(latest))
 print(out.get('status',{}).get('stdout','').split('p4:')[-1][:650])
 if 'eval'in out:print(out['eval'].get('stdout',''))
if a.compact and 'chat'in out:
 cf=dest/'LAST_REVIEWED_CHAT_ID';lastchat=int(cf.read_text())if cf.exists()else 1391;newlast=lastchat
 for line in out['chat'].get('stdout','').splitlines():
  cm=re.match(r'#(\d+)',line)
  if cm:
   cn=int(cm[1]);newlast=max(cn,newlast)
   if cn>lastchat:print('TEAMCHAT',line)
 cf.write_text(str(newlast))
if a.compact and 'events'in out:
 ef=dest/'LAST_REVIEWED_EVENTS.json';lines=out['events'].get('stdout','').splitlines()
 prev_events=set(json.loads(ef.read_text()))if ef.exists()else set(lines)
 for line in lines:
  if line not in prev_events:print('WORLD_EVENT',line)
 ef.write_text(json.dumps(lines))
if any(v.get('exit',1)!=0 for v in out.values()):sys.exit(1)

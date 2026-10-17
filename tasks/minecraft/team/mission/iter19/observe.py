"""Read-only arena capture. Never runs/says/claims a player or accesses server files."""
import argparse, datetime, json, pathlib, re, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('mode',choices=['status','chat','programs','events','eval']);p.add_argument('--last',type=int,default=8);p.add_argument('--player');a=p.parse_args()
root=pathlib.Path.cwd();dest=root/'tasks/minecraft/team/mission/iter19/observations';dest.mkdir(exist_ok=True)
args=[sys.executable,'tools/eval_minecraft.py'] if a.mode=='eval' else [sys.executable,'tools/mc_arena.py',a.mode]
if a.mode in ['chat','programs','events']:args+=['--last',str(a.last)]
if a.mode=='programs':
 args+=['--full']
 if a.player:args+=['--player',a.player]
started=datetime.datetime.now(datetime.timezone.utc);r=subprocess.run(args,cwd=root,text=True,capture_output=True,timeout=40)
tag=started.strftime('%H%M%S_%f')+'_'+a.mode+('_'+a.player if a.player else '')
(dest/(tag+'.txt')).write_text(r.stdout+'\nSTDERR:\n'+r.stderr)
print(json.dumps({'capture':str(dest/(tag+'.txt')),'utc':started.isoformat(),'returncode':r.returncode,'bytes':len(r.stdout)}))
if a.mode!='programs':print(r.stdout);sys.exit(r.returncode)
for block in re.split(r'(?=^== #\d+ )',r.stdout,flags=re.M):
 if not block.strip():continue
 header=block.splitlines()[0];print(header)
 if '-- returned --' not in block:print('NO_RETURN_SECTION');continue
 returned=block.split('-- returned --',1)[1].strip()
 try:
  value=json.loads(returned);(dest/(tag+'_'+re.search(r'#(\d+)',header).group(1)+'.json')).write_text(json.dumps(value,indent=2))
  if isinstance(value,dict):
   print('RETURN_KEYS:',','.join(value))
   important={k:v for k,v in value.items() if re.search(r'issue|error|ending|effect|attack|reach|closed|health|^hp$|position|^p$|^at$|minRange|initialHP|minimumHP|retreated|stagePhase|injuryEvents|preparedGaps|inventory|^inv$|^stock$|^wood$|^giftPicks$|^caps$|^callable$|ground|currentCloud|trialComplete|climbed|removed|respawn|Proof|entered|atGoal|lost|before|after|crystal|dragon|retained|life|receipt|elapsed',k,re.I)}
   out=json.dumps(important); print(out[:6500]);print('SUMMARY_TRUNCATED' if len(out)>6500 else '')
  else:print(json.dumps(value)[:3500])
 except Exception as e:print('RETURN_PARSE_UNAVAILABLE',str(e),returned[:2500])

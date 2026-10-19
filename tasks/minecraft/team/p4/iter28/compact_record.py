"""Bounded summaries of permitted arena records. No source execution or outcome reconstruction."""
import argparse,json,pathlib,re
p=argparse.ArgumentParser();p.add_argument('record');p.add_argument('--id',type=int);a=p.parse_args()
f=pathlib.Path(a.record);root=pathlib.Path('tasks/minecraft/team').resolve()
if not f.resolve().is_relative_to(root):raise SystemExit('Expected allowed team record')
s=f.read_text();chunks=re.split(r'(?m)^== #',s)
chunks=['== #'+c for c in chunks[1:]] if len(chunks)>1 else [s]
def brief(x):
 if not isinstance(x,dict):return x
 for k in ['state','s','after']:
  if isinstance(x.get(k),dict):x=x[k];break
 keys=['at','p','hp','health','food','dim','dimension','ground','grounded','controls','goal']
 out={k:x[k] for k in keys if k in x}
 for key in ['inv','inventory']:
  if key in x:out[key]=x[key]
 return out
for c in chunks:
 h=re.search(r'(?m)^(?:== #|(?:\[sandbox\] )?program #)(\d+)([^\n]*)',c)
 if not h or (a.id is not None and int(h[1])!=a.id):continue
 split=re.split(r'(?m)^-{2,3} output -{2,3}$',c,maxsplit=1)
 if len(split)<2:
  print(json.dumps({'id':int(h[1]),'outputSectionPresent':False,'ending':'unknown'}));continue
 source,out=split
 cut=re.split(r'(?m)^-{2,3} returned -{2,3}$',out,maxsplit=1);body=cut[0];ret=None;returnError=None
 if len(cut)>1:
  t=cut[1].lstrip()
  if t.startswith(('{','[')):
   try:ret=json.JSONDecoder().raw_decode(t)[0]
   except json.JSONDecodeError as e:returnError=str(e)
 logs=[];errors=[]
 for line in body.splitlines():
  if re.match(r'^(?:FAILURE|RECOVERY_FAILURE|ERROR|REFUSAL)\b',line):errors.append(line[:380])
  m=re.match(r'^([A-Z][A-Z0-9_]*) (\{.*\})$',line)
  if m:
   try:logs.append((m[1],json.loads(m[2])))
   except json.JSONDecodeError:pass
 boundaries=[];posts=[];traces=[];milestones=[]
 for k,v in logs:
  if not isinstance(v,dict):continue
  faces=v.get('faces',v.get('cells',v.get('shell')))
  if isinstance(faces,list) and faces and all(isinstance(z,dict) and ('full'in z or 'unitFull'in z) for z in faces):
   boundaries.append({'marker':k,'state':brief(v),'full':sum(z.get('full',z.get('unitFull')) is True for z in faces),'total':len(faces)})
  if k=='HAZARD_TRACE':traces.append(v)
  if 'POST'in k:posts.append((k,v))
  if any(z in k for z in ['RELEASE','THROW','SHOT','COMMIT','ESCAPE_START','CURSOR','ORDINARY_MELEE']) and 'POST'not in k:
   milestones.append({'marker':k,'value':v})
 post=posts[-1][1] if posts else {};rows=[r for t in traces for r in t.get('rows',[])];events=post.get('events',[])
 deaths=[r for r in rows if r.get('event')=='death' or r.get('hp')==0]
 gone=[e for e in events if e.get('event')=='gone' and e.get('e',{}).get('name')=='end_crystal']
 result={'file':str(f),'id':int(h[1]),'header':h[0],'arenaOutputTruncated':'[output truncated]'in c,'returnedSectionPresent':len(cut)>1,'returnParseError':returnError,'returnedState':brief(ret),'errors':errors[:4],'errorCount':len(errors),'boundaryRows':len(boundaries),'lastBoundary':boundaries[-1]if boundaries else None,'postMarker':posts[-1][0]if posts else None,'fired':post.get('fired'),'attacked':post.get('attacked'),'targetPresent':post.get('targetPresent'),'postCrystalCount':len(post['crystals'])if isinstance(post.get('crystals'),list)else None,'postState':brief(post),'eventCounts':{e:sum(x.get('event')==e for x in events)for e in sorted({str(x.get('event'))for x in events})},'actualCrystalGone':gone,'traceRows':len(rows),'traceDropped':sum(t.get('dropped',0)for t in traces),'deathObservedInRetainedTrace':bool(deaths),'milestoneCount':len(milestones),'milestones':milestones[:2]+milestones[-2:]if len(milestones)>4 else milestones,'limits':'Printed retained records only; no-score/no-exhaustive-hazard/no-adoption oracle. Later canonical death can supersede return.'}
 # Do not print giant detail fields; exact source/records remain the evidence.
 for row in result['milestones']:
  raw=json.dumps(row['value']);row['value']=row['value']if len(raw)<=650 else {'detailOmitted':True,'jsonBytes':len(raw),'state':brief(row['value'])}
 print(json.dumps(result,separators=(',',':')))

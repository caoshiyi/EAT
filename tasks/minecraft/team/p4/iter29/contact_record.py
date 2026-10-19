"""Compact retained observations; never classifies score or combat success."""
import json,re,sys,pathlib
f=pathlib.Path(sys.argv[1]);root=pathlib.Path('tasks/minecraft/team').resolve()
if not f.resolve().is_relative_to(root):raise SystemExit('Expected permitted team record')
s=f.read_text();parts=re.split(r'(?m)^(?=== #)',s)
for part in parts:
 h=re.search(r'(?m)^(?:== #|(?:\[sandbox\] )?program #)(\d+)([^\n]*)',part)
 if not h:continue
 sections=re.split(r'(?m)^-{2,3} output -{2,3}$',part,maxsplit=1)
 if len(sections)<2:continue
 out=re.split(r'(?m)^-{2,3} returned -{2,3}$',sections[1],maxsplit=1)[0]
 rows=[];errors=[]
 for line in out.splitlines():
  if re.match(r'^(?:FAILURE|RECOVERY_FAILURE|ERROR|REFUSAL)',line):errors.append(line.split(' {')[0])
  m=re.fullmatch(r'([A-Z][A-Z0-9_]*) (\{.*\})',line)
  if m:
   try:rows.append((m[1],json.loads(m[2])))
   except json.JSONDecodeError:pass
 posts=[(k,x)for k,x in rows if 'POST'in k];post=posts[-1][1]if posts else{};st=post.get('state',post)
 bounds=[x for k,x in rows if isinstance(x.get('faces'),list)];traces=[x for k,x in rows if k=='HAZARD_TRACE']
 print(json.dumps({'id':int(h[1]),'header':h[0],'truncated':'[output truncated]'in part,'errors':errors,'postMarker':posts[-1][0]if posts else None,'at':post.get('at') or st.get('at'),'p':st.get('p'),'hp':st.get('hp'),'food':st.get('food'),'wear':st.get('wear'),'elapsedMs':post.get('elapsedMs'),'attacked':post.get('attacked'),'best':post.get('best'),'bestRow':post.get('bestRow'),'lastBestObserved':next((x for k,x in reversed(rows)if k in ['BEST_CONTACT','BEST_FUTURE']),None),'classifications':[{ 'marker':k,'value':x}for k,x in rows if 'CLASSIFICATION'in k],'samples':post.get('samples'),'contactRows':post.get('rows'),'events':post.get('events'),'boss':post.get('boss'),'dragonEvidence':next((x for k,x in reversed(rows)if k=='DRAGON_EVIDENCE'),None),'boundaries':[{ 'at':x.get('state',{}).get('at'),'full':sum(z.get('full')is True for z in x['faces']),'total':len(x['faces'])}for x in bounds],'ordinaryMarkers':[{ 'marker':k,'value':x}for k,x in rows if k in ['ORDINARY_CONTACT','ACTUAL_ORDINARY_MELEE']],'traceRows':sum(len(x.get('rows',[]))for x in traces),'traceDropped':sum(x.get('dropped',0)for x in traces),'limits':'retained observations only; no success, absence or adoption oracle'}))

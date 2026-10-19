"""Summarize retained public output, never infer official score or missing events."""
import json,pathlib,re,sys
p=pathlib.Path(sys.argv[1]);s=p.read_text()
parts=re.split(r'(?m)^== #',s);parts=['== #'+x for x in parts[1:]] if len(parts)>1 else [s]
for part in parts:
 h=part.splitlines()[0]
 split=re.split(r'(?m)^-{2,3} output -{2,3}$',part,maxsplit=1)
 if len(split)<2:continue
 out=split[1];parsed=[]
 for line in out.splitlines():
  m=re.match(r'^([A-Z][A-Z0-9_]*) (\{.*\})$',line)
  if m:
   try:parsed.append((m[1],json.loads(m[2])))
   except json.JSONDecodeError:pass
 traces=[v for k,v in parsed if k=='HAZARD_TRACE']
 post=next((v for k,v in reversed(parsed) if k in ['SURFACE_ACTUAL_POST','RAPID_POST','SHOT_POST']),None)
 rows=[r for t in traces for r in t.get('rows',[])]
 death=any(r.get('event')=='death' or r.get('hp')==0 for r in rows)
 result={'source':str(p),'header':h,'outputTruncated':'[output truncated]' in out,'deathObservedInRetainedTrace':death,
  'operationErrors':[line[:500] for line in out.splitlines() if line.startswith(('FAILURE ','RECOVERY_FAILURE '))],
  'traceRows':len(rows),'traceEvictions':sum(t.get('dropped',0) for t in traces),
  'consequentialEvents':[r for r in rows if r.get('event') in ['health','death','entitySpawn','entityGone']],
  'limits':'Retained public output only. Unobserved events are unknown. Effect candidate is NOT score or sufficient live adoption.'}
 if post:
  st=post.get('state',{});dim=st.get('dim',st.get('dimension'));hp=st.get('hp')
  events=post.get('events',[]);crystalGone=any(e.get('event')=='gone' and e.get('e',{}).get('name')=='end_crystal' for e in events)
  result.update({'fired':post.get('fired'),'targetPresent':post.get('targetPresent'),'postDimension':dim,'postHp':hp,'postPosition':st.get('p'),
   'flightSamples':len(post.get('flight',post.get('tracks',[]))),'postLoadedCrystalCount':len(post.get('crystals',[])),
   'crystalGoneObserved':crystalGone,'sameLifeEndEffectCandidate':bool(post.get('fired') and post.get('targetPresent') is False and dim=='the_end' and isinstance(hp,(float,int)) and hp>0 and not death and crystalGone)})
 print(json.dumps(result,indent=2))

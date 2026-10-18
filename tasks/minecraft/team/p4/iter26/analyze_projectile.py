"""Read-only analysis of exact PROJECTILE_POST arena output. No Minecraft physics assumed."""
import argparse,json,math,pathlib
p=argparse.ArgumentParser();p.add_argument('record');a=p.parse_args()
rows=[]
for line in pathlib.Path(a.record).read_text().splitlines():
 if line.startswith('PROJECTILE_POST '):rows.append(json.loads(line.split(' ',1)[1]))
if not rows:raise SystemExit('No PROJECTILE_POST record found; no flight inference.')
for r in rows:
 report={'input':a.record,'beforeAt':r.get('before',{}).get('at'),'afterAt':r.get('after',{}).get('at'),'inventoryDelta':r.get('inventoryDelta'),'failure':r.get('failure'),'targetPresent':r.get('targetPresent'),'warning':'Observed positions are not proof of full flight, impact, maximum range, or crystal damage.','tracks':[]}
 for t in r.get('tracks',[]):
  unique=[];seen=set()
  for s in t.get('samples',[]):
   v=s.get('p',{});k=tuple(v.get(c) for c in ['x','y','z'])
   if None in k or k in seen:continue
   seen.add(k);unique.append(s)
  row={'id':t['id'],'sampleCount':len(t.get('samples',[])),'uniquePositions':len(unique)}
  if unique:
   o=unique[0]['p'];rad=[math.hypot(s['p']['x']-o['x'],s['p']['z']-o['z']) for s in unique];ys=[s['p']['y'] for s in unique]
   row.update({'tickSpan':[unique[0]['tick'],unique[-1]['tick']],'observedHorizontalDisplacementFromFirstSample':max(rad),'observedYBounds':[min(ys),max(ys)],'positionTimes':[s.get('at') for s in unique]})
   ds=[s.get('targetDistance') for s in unique if isinstance(s.get('targetDistance'),(int,float))]
   if ds:row['closestObservedTargetDistance']=min(ds)
  if len(unique)<4:row['decision']='INSUFFICIENT_FLIGHT_DATA: no curve/range/impact inference'
  else:row['decision']='Multiple real positions available; inspect collision/visibility/target events before any fitted or extrapolated trajectory.'
  report['tracks'].append(row)
 print(json.dumps(report,indent=2))

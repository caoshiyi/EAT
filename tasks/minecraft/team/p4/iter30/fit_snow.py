"""Fit one actual OW throw; model is not a hit/visibility/reach permission."""
import json,math,pathlib
root=pathlib.Path('tasks/minecraft/team/p4/iter30');raw=json.loads((root/'snow_flight_raw.json').read_text());rows=raw['rows'];r0=rows[0];v0=r0['velocity'];p0=r0['p']
ar=[(r['velocity']['x']/v0['x'])**(1/r['tick']) for r in rows[1:] if r['tick']>0]
a=sum(ar)/len(ar)
gr=[(a**r['tick']*v0['y']-r['velocity']['y'])*(1-a)/(1-a**r['tick']) for r in rows[1:]]
g=sum(gr)/len(gr)
def point(n,vx,vy,vz=0,p=(0,0,0),a=a,g=g):
 S=(1-a**n)/(1-a);return[p[0]+vx*S,p[1]+(vy+g/(1-a))*S-g*n/(1-a),p[2]+vz*S]
errs=[]
for r in rows:
 pred=point(r['tick'],v0['x'],v0['y'],v0['z'],[p0[k]for k in['x','y','z']])
 errs.append(dict(tick=r['tick'],pred=pred,actual=[r['p'][k]for k in['x','y','z']],error=math.dist(pred,[r['p'][k]for k in['x','y','z']])))
speed=math.sqrt(sum(v0[k]**2 for k in['x','y','z']))
spawn_bonus=p0['y']-raw['source']['y0']-1.62
source_y=58+1.62+spawn_bonus
best=None
for pitch10 in range(1,900):
 p=math.radians(pitch10/10);vx=speed*math.cos(p);vy=speed*math.sin(p)
 for n in range(1,140):
  x,y,_=point(n,vx,vy,p=(0,source_y,0))
  if y>=83-.125 and (best is None or x>best['horizontal']):
   best=dict(pitch_deg=pitch10/10,tick=n,horizontal=x,y=y)
peak=max(rows,key=lambda r:r['p']['y'])
out=dict(derivedFrom="one actual LIVE11856 OW60degree nativejumpthrow; no excluded sources",a=a,aObservedRange=[min(ar),max(ar)],g=g,gObservedRange=[min(gr),max(gr)],v0=v0,speed=speed,spawnHeightAboveStandingEye=spawn_bonus,positionChecks=errs,maxPositionError=max(r['error']for r in errs),observedPeak=dict(tick=peak['tick'],p=peak['p']),endFieldHypothesis=dict(source=[6.503142,58,-25.499962],target=[33.5,83,24.5],horizontal=math.hypot(33.5-6.503142,24.5+25.499962),modelMaxHorizontalAtTargetHeight=best),
limits=["OW motion only; End transfer untested","one throw cannot estimate dispersion","no block/entity collisions in model","gone event has no sampled impact cause","future initial velocity and pose must be observed","roof shapes and actual hit/retention still required"])
(root/'snow_flight_fit.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:out[k]for k in['a','g','speed','maxPositionError','observedPeak','endFieldHypothesis','limits']},indent=2))

"""Conditional trajectory fit from PUBLIC arena observation only; no external physics."""
import argparse,json,math
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('record');a=p.parse_args()
text=Path(a.record).read_text()
post=json.loads(next(l.split(' ',1)[1] for l in text.splitlines() if l.startswith('PROJECTILE_POST ')))
pre=json.loads(next(l.split(' ',1)[1] for l in text.splitlines() if l.startswith('PROJECTILE_PRE ')))
samples=[];seen=set()
for x in post['tracks'][0]['samples']:
 k=tuple(x['p'][c] for c in 'xyz')
 if k not in seen:samples.append(x);seen.add(k)
if len(samples)<4:raise SystemExit('REFUSE_FIT: need four distinct observed positions plus velocities; no range claim.')
ratios=[samples[i+1]['velocity']['x']/samples[i]['velocity']['x'] for i in range(len(samples)-1)]
r=sum(ratios)/len(ratios);fits=[]
for steps in range(1,21):
 q=r**(1/steps)
 gs=[(r*samples[i]['velocity']['y']-samples[i+1]['velocity']['y'])*(1-q)/(1-r) for i in range(len(samples)-1)]
 g=sum(gs)/len(gs);res=[]
 for i in range(len(samples)-1):
  pos=samples[i]['p'].copy();vel=samples[i]['velocity'].copy()
  for n in range(steps):
   for c in 'xyz':pos[c]+=vel[c];vel[c]*=q
   vel['y']-=g
  res.append(math.sqrt(sum((pos[c]-samples[i+1]['p'][c])**2 for c in 'xyz')))
 fits.append((max(res),steps,q,g))
error,steps,q,g=min(fits)
speed=math.sqrt(sum(z*z for z in samples[0]['velocity'].values()))
target=pre['target'];origin=samples[0]['p']
if target is None:raise SystemExit('REFUSE_TARGET_FIT: no actual crystal target in this trial.')
t=target['p'];R=math.hypot(t['x']-origin['x'],t['z']-origin['z']);dy=t['y']+.65-origin['y'];best=(-1e9,0,0)
for deg10 in range(1,900):
 th=math.radians(deg10/10);x=y=0;vx=speed*math.cos(th);vy=speed*math.sin(th)
 for tick in range(160):
  nx=x+vx;ny=y+vy
  if nx>=R:
   height=y+(ny-y)*(R-x)/(nx-x)
   if height>best[0]:best=(height,deg10/10,tick+1)
   break
  x,y=nx,ny;vx*=q;vy=vy*q-g
print(json.dumps({'source':a.record,'scope':'PUBLIC observed positions/velocities only; conditional predictive fit, no objective effect','distinct_positions':len(samples),'fitted_steps_between_updates':steps,'maximum_interval_prediction_error_blocks':error,'drag':q,'downward_velocity_increment':g,'launch_speed':speed,'target_id':target['id'],'target_horizontal_distance':R,'required_dy':dy,'predicted_max_dy_at_target_radius':best[0],'model_best_elevation_degrees':best[1],'model_step_count':best[2],'limits':'Fit is conditional on constant drag/gravity/launch speed and equal update intervals. No future collision, dispersion, target damage, absolute range or immunity proof. Actual source/stance/LOS/HP and retained ending still required. New consequential operations need small practice qualification.'},indent=2))

"""Offline prediction-error audit against retained live samples; no world actions."""
import json,math,datetime,bisect,statistics
from pathlib import Path
rows=json.loads(Path('tasks/minecraft/team/p3/iter36/trajectory_13901.json').read_text())['rows']
ts=[datetime.datetime.fromisoformat(r['at'].replace('Z','+00:00')).timestamp() for r in rows]
ps=[tuple(r['root'][k] for k in 'xyz') for r in rows]
def at(t):
 i=bisect.bisect_left(ts,t)
 if i==0 or i==len(ts):return None
 a=(t-ts[i-1])/(ts[i]-ts[i-1]);return tuple(x+(y-x)*a for x,y in zip(ps[i-1],ps[i]))
def diff(a,b,dt):return tuple((x-y)/dt for x,y in zip(a,b))
def rot(x,z,a):return x*math.cos(a)-z*math.sin(a),x*math.sin(a)+z*math.cos(a)
def predict(t,h,method):
 p,a,b=at(t),at(t-.3),at(t-.6)
 if any(q is None for q in [p,a,b]):return None
 v=diff(p,a,.3)
 if method=='linear':return tuple(x+h*y for x,y in zip(p,v))
 u=diff(a,b,.3);omega=math.atan2(u[0]*v[2]-u[2]*v[0],u[0]*v[0]+u[2]*v[2])/.3
 omega=max(-3,min(3,omega));vx,vz=rot(v[0],v[2],omega*.15)
 if abs(omega)<1e-5:dx,dz=vx*h,vz*h
 else:dx=(vx*math.sin(omega*h)-vz*(1-math.cos(omega*h)))/omega;dz=(vx*(1-math.cos(omega*h))+vz*math.sin(omega*h))/omega
 return p[0]+dx,p[1]+h*v[1],p[2]+dz
for h in [1.,1.25,1.6]:
 for method in ['linear','turn']:
  err=[]
  for t in ts:
   pred,actual=predict(t,h,method),at(t+h)
   if pred is None or actual is None:continue
   err.append(math.hypot(pred[0]-actual[0],pred[2]-actual[2]))
  print(json.dumps({'method':method,'horizon':h,'samples':len(err),'median_xz_error':statistics.median(err),'p90_xz_error':sorted(err)[int(.9*len(err))]}))

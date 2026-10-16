"""Inference from actual recorded Eye positions only; synthetic test is not world evidence."""
import math,json,sys

def bearing(points):
 if len(points)<2:return None
 a=points[0];b=points[-1];dx=b['x']-a['x'];dz=b['z']-a['z'];d=math.hypot(dx,dz)
 if d<1:return None
 return dict(origin=[a['x'],a['z']],direction=[dx/d,dz/d],distance=d,yaw=math.degrees(math.atan2(-dx,dz)))

def cross(a,b):return a[0]*b[1]-a[1]*b[0]
def intersect(a,b):
 u,v=a['direction'],b['direction'];det=cross(u,v)
 if abs(det)<1e-5:return dict(qualified=False,reason='parallel_or_indistinguishable')
 q=[b['origin'][i]-a['origin'][i] for i in (0,1)];t=cross(q,v)/det;s=cross(q,u)/det
 return dict(qualified=t>0 and s>0,point=[a['origin'][i]+t*u[i] for i in (0,1)],forward=[t,s],sine_angle=abs(det))

def test():
 assert bearing([{'x':0,'z':0},{'x':2,'z':0}])['direction']==[1,0]
 assert bearing([{'x':0,'z':0},{'x':0,'z':-2}])['direction']==[0,-1]
 assert bearing([{'x':0,'z':0},{'x':.1,'z':.1}]) is None
 p=intersect({'origin':[0,0],'direction':[1,1]},{'origin':[200,0],'direction':[-1,1]})
 assert p['qualified'] and p['point']==[100,100]
 assert not intersect({'origin':[0,0],'direction':[1,0]},{'origin':[0,1],'direction':[1,0]})['qualified']
 print('5 synthetic geometry checks passed; no world flight claimed')
if __name__=='__main__':
 if sys.argv[1:] == ['--self-test']:test()
 else:
  flights=[]
  for f in sys.argv[1:]:
   raw=json.load(open(f));flights.extend(raw.get('flights',[raw]))
  rays=[bearing(f['points']) for f in flights];print(json.dumps({'bearings':rays,'intersection':intersect(*rays[:2]) if len(rays)>1 and all(rays[:2]) else None},indent=2))

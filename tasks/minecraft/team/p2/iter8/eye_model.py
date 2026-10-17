"""Public vanilla1.20.4 motion model, no world/seed input. Compare saved player-observed flight."""
import struct,math,json,re
from pathlib import Path
D=Path(__file__).resolve().parent
F=lambda x:struct.unpack('!f',struct.pack('!f',x))[0]
U=lambda x:struct.unpack('!Q',struct.pack('!d',x))[0]
V=lambda x:struct.unpack('!d',struct.pack('!Q',x))[0]
BIAS=V(4805340802404319232)
def atan(y,x):
 f=x*x+y*y;ny=y<0;nx=x<0;y=abs(y);x=abs(x);sw=y>x
 if sw:x,y=y,x
 g=V(6910469410427058090-(U(f)>>1));g=g*(1.5-.5*f*g*g);x*=g;y*=g
 h=BIAS+y;i=U(h)&0xffffffff;j=math.asin(i/256);k=math.cos(j);l=h-BIAS;m=y*k-x*l
 o=j+(6+m*m)*m/6
 if sw:o=math.pi/2-o
 if nx:o=math.pi-o
 if ny:o=-o
 return o

def model(origin,target):
 x,y,z=origin;vx=vy=vz=0.;d=math.hypot(target[0]-x,target[1]-z);tx=x+(target[0]-x)*12/d;tz=z+(target[1]-z)*12/d;ty=y+8;out=[(x,y,z)]
 for n in range(80):
  a,b,c=x+vx,y+vy,z+vz;g=math.hypot(vx,vz);h,i=tx-a,tz-c;j=F(math.hypot(h,i));k=F(atan(i,h));l=g+.0025*(j-g);m=vy
  if j<1:l*=.8;m*=.8
  vx=math.cos(k)*l;vy=m+((1 if y<ty else -1)-m)*F(.015);vz=math.sin(k)*l;x,y,z=a,b,c;out.append((x,y,z))
 return out

def run():
 raw=(D.parent.parent/'p1/iter7/eye_first.log').read_text();e=json.loads(re.search(r'ACTUAL_EYE_EVIDENCE (.*)',raw).group(1));pts=e['flights']['11635']['points'];o=tuple(pts[0][k] for k in ['x','y','z']);res=[]
 # Generous first-ring extent incl biome shift; all chunkcorner candidates close to observedray.
 ray=e['rays'][0]
 for z in range(1024,2945,16):
  x=round((o[0]+(z-o[2])*ray['dx']/ray['dz'])/16)*16
  err=abs((x-o[0])*ray['dz']-(z-o[2])*ray['dx'])
  if err>.7:continue
  m=model(o,(x,z));errors=[];samples=[]
  for p in pts[1:]:
   # Packet scheduling inferred only through best perpoint match, no claim exact tick alignment.
   n=min(range(1,81),key=lambda n:sum((p[k]-m[n][j])**2 for j,k in enumerate(['x','y','z'])))
   ex=p['x']-m[n][0];ez=p['z']-m[n][2];errors.append(ex*ex+ez*ez);samples.append([p['t'],n,ex,ez])
  res.append(dict(target=[x,z],ray_residual=err,rmse=math.sqrt(sum(errors)/len(errors)),max_error=math.sqrt(max(errors)),samples=samples))
 res.sort(key=lambda q:q['rmse']);(D/'eye_model_results.json').write_text(json.dumps(res,indent=2));print(json.dumps([{k:v for k,v in q.items() if k!='samples'} for q in res],indent=2));print('best samples',res[0]['samples'])
if __name__=='__main__':run()

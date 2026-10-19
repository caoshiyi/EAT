"""One-shot descriptive public-flight fit; hypothetical compensation, not action admission."""
import json,math,pathlib
root=pathlib.Path('tasks/minecraft/team/p4/iter27')
raw=(root/'G6_latest.txt').read_text().split('-- output --')[-1]
shot=json.loads(next(l.split(' ',1)[1] for l in raw.splitlines() if l.startswith('ACTUAL_SURFACE_SHOT ')))
post=json.loads(next(l.split(' ',1)[1] for l in raw.splitlines() if l.startswith('SURFACE_ACTUAL_POST ')))
u=[]
for r in post['flight']:
 if not u or r['p']!=u[-1]['p']:u.append(r)
o=u[0]['p'];target=shot['target']['p'];dx=target['x']-o['x'];dz=target['z']-o['z'];R=math.hypot(dx,dz);nx,nz=dx/R,dz/R
vel=u[0]['velocity'];camera=shot['pitch'];vh=vel['x']*nx+vel['z']*nz;speed=vh/math.cos(camera);boost=vel['y']-speed*math.sin(camera)
def predict(angle,targetY):
 vx=speed*math.cos(angle);vy=speed*math.sin(angle)+boost;x=0;y=o['y']
 for tick in range(1,161):
  px,py=x,y;x+=vx;y+=vy
  if x>=R:return py+(y-py)*(R-px)/(x-px)
  vx*=.99;vy=vy*.99-.03
 return None
roots=[]
for targetY in [86.5,87.0,87.5]:
 last=None
 for i in range(2000,8501):
  deg=i/100;v=predict(math.radians(deg),targetY)
  if v is not None and last and (v-targetY)*(last[1]-targetY)<=0:
   roots.append({'targetY':targetY,'cameraDegreesApprox':deg,'previousDegrees':last[0]})
  last=(deg,v) if v is not None else None
pred=[o['x'],o['y'],o['z']];vv=[vel['x'],vel['y'],vel['z']];errors=[]
for tick in range(81):
 found=next((r for r in u if r['tick']==tick),None)
 if found:errors.append({'tick':tick,'distance':math.dist(pred,[found['p'][k] for k in ['x','y','z']])})
 pred=[a+b for a,b in zip(pred,vv)];vv=[vv[0]*.99,vv[1]*.99-.03,vv[2]*.99]
result={'actualVelocityReplayErrors':errors,'scope':'ONE actual shot, fitted vertical residual may combine player motion and random dispersion; no actual player vertical velocity logged',
 'origin':o,'R':R,'actualCameraDegrees':math.degrees(camera),'actualProjectileVelocity':vel,'projectedHorizontalVelocity':vh,
 'hypotheticalSpeedAlongCamera':speed,'hypotheticalVerticalResidual':boost,'dragAssumed':.99,'gravityIncrementAssumed':.03,
 'hypotheticalRoots':roots,'requiredAdoptionTest':'Log actual player velocity, actual camera and fresh projectile trajectory from same stance; one real target effect plus retained ending. Do not infer safety or visibility.'}
(root/'fit159.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))

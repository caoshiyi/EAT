"""Conditional projectile model, grounded in actual iter28 velocities. No action admission."""
import math,json
from pathlib import Path
# Observed first-ten-step public velocities fit drag=.99 and gravity=.03.
def flight(angle,boost=.42,y0=60.94):
 a=math.radians(angle); x,y,vx,vy=0,y0,1.5*math.cos(a),1.5*math.sin(a)+boost;out=[]
 for k in range(120):
  out.append((x,y,k));x+=vx;y+=vy;vx*=.99;vy=vy*.99-.03
 return out
cases=[]
for R,Y,y0 in [(17,98.8,60.94),(18,104.8,62.94),(20,92.8,60.94)]:
 best=[]
 for a100 in range(6500,8800):
  a=a100/100;pts=flight(a,y0=y0)
  for (x,y,k),(xx,yy,kk) in zip(pts,pts[1:]):
   if x<=R<=xx:
    z=y+(yy-y)*(R-x)/(xx-x);best.append((abs(z-Y),a,z,k));break
 cases.append({'R':R,'targetY':Y,'launchY':y0,'nominalBoost':.42,'best':sorted(best)[:3]})
print(json.dumps({'scope':'HYPOTHESIS ONLY: initial jump server boost .42 is untested; no transfer from fourth-tick .1648','cases':cases},indent=2))

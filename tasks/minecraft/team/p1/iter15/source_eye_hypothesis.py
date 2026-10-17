"""Historical geometry calculation only; no player/world action."""
import json
# Actual7506 before/after hit positions; known LOW roof (-132,64,-430) full.
player=(-132.3466690375523,62,-429.4547250664872)
targets=[(-129.19450370377538,63,-428.85209868599964),(-129.8965982062935,63,-429.24347174905984)]
lo=(-132,64,-430);hi=(-131,65,-429)
def hit(a,b):
 t0,t1=0.,1.
 for k in range(3):
  d=b[k]-a[k]
  if abs(d)<1e-12:
   if not lo[k]<=a[k]<=hi[k]:return False
  else:
   x,y=sorted(((lo[k]-a[k])/d,(hi[k]-a[k])/d));t0=max(t0,x);t1=min(t1,y)
   if t0>t1:return False
 return True
for target in targets:
 enemy=(target[0],target[1]+1.53,target[2])
 print(json.dumps({'actualTarget':target,'assumedBlazeEyeOffset':1.53,'standingEyeOffset':1.62,'crouchingEyeOffset':1.27,'standingRoofIntersection':hit((player[0],player[1]+1.62,player[2]),enemy),'crouchingRoofIntersection':hit((player[0],player[1]+1.27,player[2]),enemy)}))

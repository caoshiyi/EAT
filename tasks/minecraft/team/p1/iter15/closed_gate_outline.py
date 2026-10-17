"""Narrow historical AABB test only, not a source action or complete world LOS."""
import math,json
p=(-130.7567342179664,63.62,-429.49909045168425)
a=(-128.20500001192093,64.60,-428.58000001192096)
def hit(lo,hi):
 u,v=0.,1.
 for i in range(3):
  d=a[i]-p[i]
  if abs(d)<1e-12:
   if not lo[i]<=p[i]<=hi[i]:return False
  else:
   t=sorted(((lo[i]-p[i])/d,(hi[i]-p[i])/d));u=max(u,t[0]);v=min(v,t[1])
   if u>v:return False
 return True
print(json.dumps({'origin':p,'actual3780_AABB_point':a,'distance':math.dist(p,a),'gateOutlineBlocks':hit((-129.625,63,-430),(-129.375,64,-429)),'gateCollisionBlocks':hit((-129.625,63,-430),(-129.375,64.5,-429)),'retainedFrontRoofBlocks':hit((-131,64,-430),(-130,64.5,-429)),'currentEastRoofBlocks':hit((-130,64,-430),(-129,64.5,-429))},indent=2))

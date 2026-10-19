"""Hypothetical rays in permitted player census. No gameplay/action/damage oracle."""
import json,math,pathlib
root=pathlib.Path('tasks/minecraft/team');c=json.loads((root/'p2/iter29/east80_census.json').read_text());cells={tuple(b['p'][k]for k in['x','y','z']):b for b in c['cells']}
def intersects(a,b,lo,hi):
 t0,t1=0.,1.-1e-7
 for j in range(3):
  d=b[j]-a[j]
  if abs(d)<1e-10:
   if a[j]<lo[j]or a[j]>hi[j]:return False
  else:
   x,y=(lo[j]-a[j])/d,(hi[j]-a[j])/d
   if x>y:x,y=y,x
   t0,t1=max(t0,x),min(t1,y)
   if t0>t1:return False
 return t1>1e-7 and t0<1.-1e-7
# Small mathematical sanity cases, not Minecraft qualification.
assert intersects((0,0,0),(2,0,0),(1,-1,-1),(1.5,1,1))
assert not intersects((0,2,0),(2,2,0),(1,-1,-1),(1.5,1,1))
def blocked(a,b,remove,wall):
 for pos,x in cells.items():
  if pos in remove:continue
  for s in x['shapes']:
   if intersects(a,b,tuple(pos[j]+s[j]for j in range(3)),tuple(pos[j]+s[j+3]for j in range(3))):return True
 for pos in wall:
  if intersects(a,b,pos,tuple(v+1 for v in pos)):return True
 return False
out=[]
for name,feet,remove,wall in[
 ('standing78_removebar79',78,{(31,79,-25)},set()),
 ('standing78_wall79_removebars79_80',78,{(31,79,-25),(31,80,-25)},{(31,79,-25)}),
 ('firstjump78_42_wall79_removebars79_80',78.42,{(31,79,-25),(31,80,-25)},{(31,79,-25)}),
 ('secondjump78_753_wall79_removebars79_80',78.7532,{(31,79,-25),(31,80,-25)},{(31,79,-25)}),
 ('firstjump78_42_wall79_bar80STILLpresent',78.42,{(31,79,-25)},{(31,79,-25)})]:
 eye=(30.5,feet+1.62,-24.5);aim=(32.52,max(80.03,eye[1]),-24.5);dist=math.dist(eye,aim)
 samples=[(30.5+dx,feet+dy,-24.5+dz)for dx in[-.28,0,.28]for dy in[.05,.6,1.1,1.75]for dz in[-.28,0,.28]]
 out.append({'hypothesis':name,'feet':feet,'assumedEye':eye,'candidate':aim,'distance':dist,'modelEyeRayBlocked':blocked(eye,aim,remove,wall),'bodySamples':len(samples),'openBodyRaysFromRoot80':sum(not blocked((33.5,80,-24.5),p,remove,wall)for p in samples),'openBodyRaysFromCenter81':sum(not blocked((33.5,81,-24.5),p,remove,wall)for p in samples)})
r={'censusAt':c['at'],'hypotheses':out,'limits':['Assumed player width.6,height1.8,eye1.62; owner must verify actual pose.','Hypothetical bar removals/added cover; world unchanged.','Unlisted cells modeled air; incomplete census.','Explosion origin80vs81 unknown; sample rays are NOT engine exposure/damage/health.','Only actual P2 current camera/entity cursor/reach may admit an ordinary attack.']}
(root/'p4/iter29/blast_geometry.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))

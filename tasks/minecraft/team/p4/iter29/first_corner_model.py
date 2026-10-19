"""First two west-ring rises using actual census Y76/77, hypothetical stair floors.
Transfer down toY58 requires fresh actual obsidian/support/visibility. No gameplay."""
import json,pathlib,math
root=pathlib.Path('tasks/minecraft/team');c=json.loads((root/'p2/iter29/east80_census.json').read_text());base={tuple(b['p'][k]for k in['x','y','z']):b['shapes'] for b in c['cells']}
def slab(a,b,lo,hi):
 t0,t1=0.,1.;face=None
 for j in range(3):
  d=b[j]-a[j]
  if abs(d)<1e-10:
   if not lo[j]<=a[j]<=hi[j]:return None
  else:
   p,q=(lo[j]-a[j])/d,(hi[j]-a[j])/d;sgn=-1 if d>0 else 1
   if p>q:p,q=q,p
   if p>t0:t0,face=p,(j,sgn)
   t1=min(t1,q)
   if t0>t1:return None
 return (t0,face)if t1>1e-7 and t0<=1 else None
def first(a,b,extra=()):
 hits=[];cells=dict(base);cells.update({p:[[0,0,0,1,1,1]]for p in extra})
 for p,ss in cells.items():
  for s in ss:
   h=slab(a,b,[p[j]+s[j]for j in range(3)],[p[j]+s[j+3]for j in range(3)])
   if h:hits.append((h[0],p,h[1]))
 return min(hits)if hits else None
def overlap(body,block):
 lo=[body[0]-.3,body[1],body[2]-.3];hi=[body[0]+.3,body[1]+1.8,body[2]+.3]
 return all(min(hi[i],block[i]+1)-max(lo[i],block[i])>1e-8 for i in range(3))
def eye(p):return(p[0],p[1]+1.62,p[2])
initialFloor=(30,75,-25);step1Floor=(30,76,-26);cornerFill=(31,77,-27);step2Floor=(30,77,-27)
start=(30.5,76,-24.5);at1=(30.5,77,-25.5);lean=(30.5,77,-26.15)
rows=[]
for name,p,target,extra in[
 ('firstFloor_refWest31_76_-26',start,(31.001,76.5,-25.5),(initialFloor,)),
 ('cornerRef32_77_-27_FROM_CENTER_blocked',at1,(32.001,77.5,-26.5),(initialFloor,step1Floor)),
 ('cornerRef32_77_-27_FROM_LEAN',lean,(32.001,77.5,-26.5),(initialFloor,step1Floor)),
 ('step2Floor_refNewCorner_AFTER_RECENTER',at1,(31.001,77.5,-26.5),(initialFloor,step1Floor,cornerFill))]:
 rows.append({'name':name,'body':p,'eye':eye(p),'aim':target,'distance':math.dist(eye(p),target),'modelFirstHit_t_cell_axisNormal':first(eye(p),target,extra)})
r={'censusAt':c['at'],'templateHeight':76,'rows':rows,'playerBodyIntersectsCornerFillWhileLean':overlap(lean,cornerFill),'playerBodyIntersectsStep2FloorWhileLean':overlap(lean,step2Floor),'playerBodyIntersectsStep2FloorAfterRecenter':overlap(at1,step2Floor),'blockBudget':{'step1floor':1,'cornerFill':1,'step2floor':1,'total':3},'transferTo58':{'firstGoal':[30,59,-26],'firstFloor':[30,58,-26],'firstRef':[31,58,-26],'afterFirstBody':[30.5,59,-25.5],'leanBody':[30.5,59,-26.15],'cornerFill':[31,59,-27],'cornerRef':[32,59,-27],'thenRecenter':[30.5,59,-25.5],'secondFloor':[30,59,-27],'secondGoal':[30,60,-27]},'limits':['Actual census validates upper template refs; Y58/59 refs MUST be freshly checked, not extrapolated as world fact.','Assumed body.6x1.8/eye1.62, hypothetical floors; no native lean, block placement or movement qualified.','Lean only creates sight for corner-fill. RECENTER before placing next floor, which otherwise intersects player body.','P2alone tests native sneak<=.65m, current visible face<=4.5, actual block receipt, supported landing and protected return.']}
assert rows[0]['modelFirstHit_t_cell_axisNormal'][1]==(31,76,-26)
assert rows[1]['modelFirstHit_t_cell_axisNormal'][1]!=(32,77,-27)
assert rows[2]['modelFirstHit_t_cell_axisNormal'][1]==(32,77,-27)
assert rows[3]['modelFirstHit_t_cell_axisNormal'][1]==cornerFill
assert not r['playerBodyIntersectsCornerFillWhileLean'] and r['playerBodyIntersectsStep2FloorWhileLean'] and not r['playerBodyIntersectsStep2FloorAfterRecenter']
(root/'p4/iter29/first_corner_model.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))

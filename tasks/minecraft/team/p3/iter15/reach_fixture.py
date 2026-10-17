"""Historical source geometry fixture; no assertion about current loaded source."""
import math,json
cases=[]
# Positions from actual7295; target positions copied as immutable historical observations.
targets=[(20078,(-129.85747069120407,63.10652342438698,-429.2417933105313)),(23051,(-130.92288790486694,64,-430.39717359410747)),(24197,(-130.2997465982636,63.39828580196428,-428.53932561575346))]
for name,feet,height,eye,ceiling in [('WLOW',(-132.7,61,-429.5),1.8,1.62,63),('WHIGHcrouch',(-132.7,62,-429.5),1.5,1.27,63),('LOWHIGHcrouch',(-131.5,62,-429.5),1.5,1.27,63)]:
    for entity,p in targets:
        origin=(feet[0],feet[1]+eye,feet[2]);lo=(p[0]-.3,p[1],p[2]-.3);hi=(p[0]+.3,p[1]+1.8,p[2]+.3)
        aim=tuple(max(l,min(v,h)) for l,v,h in zip(lo,origin,hi));d=math.dist(origin,aim)
        cases.append(dict(stance=name,target=entity,body_fits_under_historical_roof=feet[1]+height<=ceiling,nearest_aabb_distance=round(d,3),under2_9=d<2.9,aim=aim,los='NOT_CHECKED/current geometry required'))
assert all(not c['body_fits_under_historical_roof'] for c in cases if 'HIGH' in c['stance'])
assert all(c['body_fits_under_historical_roof'] for c in cases if c['stance']=='WLOW')
print(json.dumps(cases,indent=2))
def intersect(a,b,box):
    t0,t1=0.,1.
    for i in range(3):
        d=b[i]-a[i]
        if abs(d)<1e-9:
            if not box[i]<=a[i]<=box[i+3]:return False
        else:
            u,v=(box[i]-a[i])/d,(box[i+3]-a[i])/d
            t0=max(t0,min(u,v));t1=min(t1,max(u,v))
            if t0>t1:return False
    return t1>=0 and t0<=1
boxes={'WroofDOUBLE':(-133,63,-430,-132,64,-429),'LOWhoodBOTTOM':(-132,63,-430,-131,63.5,-429),'FRONTbottom':(-131,62,-430,-130,62.5,-429),'LOWfloor':(-132,61,-430,-131,62,-429)}
for c in cases:
    if c['stance']=='WLOW':
        c['historical_known_block_hits']=[n for n,box in boxes.items() if intersect((-132.7,62.62,-429.5),c['aim'],box)]
assert not cases[0]['historical_known_block_hits']
print('KNOWN_SHAPE_INTERSECTIONS',json.dumps([c for c in cases if c['stance']=='WLOW'],indent=2))

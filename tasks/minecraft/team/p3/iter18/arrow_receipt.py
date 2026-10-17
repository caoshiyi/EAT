#!/usr/bin/env python3
"""Saved-receipt geometry only. NO arena calls. Free flight ignores blocks/fluids/entities."""
import argparse,json,math

def vec(v):
    a=[v[k] for k in ('x','y','z')] if isinstance(v,dict) else v
    if not isinstance(a,list) or len(a)!=3 or not all(type(x) in (int,float) and math.isfinite(x) for x in a):raise ValueError('Missing/aliased/invalid vector')
    return a

def segment_box(a,b,box):
    lo,hi=0.,1.
    for i in range(3):
        d=b[i]-a[i]
        if abs(d)<1e-12:
            if not box[i]<=a[i]<=box[i+3]:return None
        else:
            x,y=sorted(((box[i]-a[i])/d,(box[i+3]-a[i])/d));lo=max(lo,x);hi=min(hi,y)
            if lo>hi:return None
    return lo

def analyze(r,plane=None):
    spawns=[a for row in r.get('trace',[]) if isinstance(row,list) and len(row)>2 and row[0]=='OBSERVED_ARROW_RELEASE' and isinstance(row[2],list) for a in row[2]]
    if len(spawns)!=1:raise ValueError('Need exactly one unaliased observed spawn; refusing ambiguity')
    a=spawns[0];origin=vec(a['p']);velocity=vec(a['v']);c=vec(r['target']['p'])
    box=[c[0]-1,c[1],c[2]-1,c[0]+1,c[1]+2,c[2]+1]
    terms=[e for e in r.get('arrowEntities',[]) if isinstance(e,list) and len(e)>=3 and e[0]==a['id']]
    terminal=vec(terms[0][1]) if len(terms)==1 else None
    p=origin[:];v=velocity[:];entry=None;cross=[];closest=None
    for t in range(110):
        if terminal is not None:
            d=sum((p[i]-terminal[i])**2 for i in range(3))
            if closest is None or d<closest['distance_squared']:closest={'tick':t,'position':p[:],'distance_squared':d}
        q=[p[i]+v[i] for i in range(3)];f=segment_box(p,q,box)
        if entry is None and f is not None:entry={'tick':t+f,'position':[p[i]+f*(q[i]-p[i]) for i in range(3)]}
        if plane is not None and p[1]!=q[1] and min(p[1],q[1])<=plane<=max(p[1],q[1]):
            f=(plane-p[1])/(q[1]-p[1]);cross.append({'tick':t+f,'direction':'down' if q[1]<p[1] else 'up','position':[p[i]+f*(q[i]-p[i]) for i in range(3)]})
        p=q;v=[x*.99-(.05000000074505806 if i==1 else 0) for i,x in enumerate(v)]
    return {'scope':'Saved measured quantized spawn + synthetic free flight only; NO live impact/hit/probability inference. Terminal velocity may be stale after impact.','projectile_id':a['id'],'observed_spawn':origin,'observed_spawn_velocity':velocity,'observed_terminal_position':terminal,'uninflated_target_box':box,'free_flight_box_entry':entry,'free_flight_plane_crossings':cross,'nearest_integer_tick_to_terminal':closest}

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('receipt');p.add_argument('--plane-y',type=float);a=p.parse_args()
    try:print(json.dumps(analyze(json.load(open(a.receipt)),a.plane_y),indent=2))
    except (ValueError,KeyError,TypeError) as e:p.exit(2,str(e)+'\n')

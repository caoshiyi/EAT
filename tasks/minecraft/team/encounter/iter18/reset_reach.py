"""Prospective arithmetic for one selected flat-plan barrier; saved JSON only, no arena.
Input: {nodes:[[x,y,z],...],barrier:[x,y,z]}, base->launch order.
Uses current shoot_original55_collision.js: y<=53 and eye->block-center<4.5.
Node centers approximate post-move poses; does not prove actual placement or safety.
"""
import json,math,sys

def screen(nodes,barrier):
    center=[v+.5 for v in barrier]
    rows=[]
    for x,y,z in reversed(nodes):
        eye=[x+.5,y+1.62,z+.5]
        d=math.dist(eye,center)
        rows.append(dict(node=[x,y,z],eye=eye,distance=d,height_eligible=y<=53,nominal_reach=y<=53 and d<4.5))
    eligible=[r for r in rows if r['height_eligible']]
    return dict(prospective=True,actual_placement_proven=False,barrier=barrier,eligible_min_distance=min((r['distance'] for r in eligible),default=None),nominal_eligible_pose=any(r['nominal_reach'] for r in rows),poses=rows)

if __name__=='__main__':
    d=json.load(open(sys.argv[1]));print(json.dumps(screen(d['nodes'],d['barrier']),indent=2))

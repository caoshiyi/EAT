"""Exact AABB eligibility bound, not an inventory receipt or movement planner."""
import argparse,json

def eligibility(player,item,height=1.8):
 px,py,pz=player;ix,iy,iz=item
 # Matched1.20.4 Player.aiStep expands body by(1,.5,1); installed dimensions player .6, item .25.
 low=(px-1.3,py-.5,pz-1.3);high=(px+1.3,py+height+.5,pz+1.3)
 itemlow=(ix-.125,iy,iz-.125);itemhigh=(ix+.125,iy+.25,iz+.125)
 gaps={axis:round(max(low[k]-itemhigh[k],itemlow[k]-high[k],0),6) for k,axis in enumerate('xyz')}
 overlaps=[low[k]<itemhigh[k] and high[k]>itemlow[k] for k in range(3)]
 return {'player':player,'item':item,'height':height,'touch_volume_low':low,'touch_volume_high':high,'axis_overlaps':overlaps,'separation_gaps':gaps,'volume_eligible':all(overlaps),'limit':'Geometry eligibility only. Delay/ownership/inventory add and actual ordinary receipt still required.'}

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--player',required=True);ap.add_argument('--item',required=True);ap.add_argument('--height',type=float,default=1.8);a=ap.parse_args();print(json.dumps(eligibility(tuple(map(float,a.player.split(','))),tuple(map(float,a.item.split(','))),a.height),indent=2))

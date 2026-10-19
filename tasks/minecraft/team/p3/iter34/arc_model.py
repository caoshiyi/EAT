"""Nominal snow arc, based on recorded public flight only; output is a hypothesis."""
import argparse,json,math

def height_at_range(angle, distance, feet_y, boost=.42):
    a=math.radians(angle);r,y=0.,feet_y+1.94
    vr,vy=1.5*math.cos(a),1.5*math.sin(a)+boost
    peak=y
    for tick in range(160):
        r0,y0=r,y;r+=vr;y+=vy;peak=max(peak,y)
        vr*=.99;vy=vy*.99-.03
        if r0<=distance<=r:
            f=(distance-r0)/(r-r0)
            return dict(elevation_deg=angle,y=y0+f*(y-y0),ticks=tick+f,peak_y=peak,descending=vy<0)
    return None

def solve(distance,feet_y,target_y):
    rows=[]
    for n in range(1000,8901):
        row=height_at_range(n/100,distance,feet_y)
        if row and row['descending']:
            row['error']=abs(row['y']-target_y);rows.append(row)
    return min(rows,key=lambda r:r['error']) if rows else None

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('range',type=float);p.add_argument('feet_y',type=float);p.add_argument('target_y',type=float);p.add_argument('--smoke',action='store_true');a=p.parse_args()
    if a.smoke:
        old=height_at_range(78.76,15.230343,58)
        assert abs(old['y']-95.0744)<.01,old
        print('SMOKE matches retained ground95 model, not a new gameplay qualification')
    print(json.dumps({'scope':'nominal hypothesis; random spread and blocks not modeled; first jump tick only','range':a.range,'feet_y':a.feet_y,'target_y':a.target_y,'candidate':solve(a.range,a.feet_y,a.target_y), 'nominally_reaches_target': (solve(a.range,a.feet_y,a.target_y) or {'error':999})['error']<=.25},indent=2))

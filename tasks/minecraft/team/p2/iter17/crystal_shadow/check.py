"""One specific geometry check from P4 actual8100 scan; not a world controller."""
import json, pathlib, math
source=pathlib.Path('tasks/minecraft/team/p4/iter17/crystal_geometry.out')
d=json.loads(source.read_text().split('--- returned ---\n')[1].split('\n--- ')[0])
rows=dict(d['rows'])
assert all(rows[y][40-35]=='obsidian' for y in [73,74,75])
crystal=(42.5,77,.5);pose=(38.5,72,.5);half=.3;height=1.8
# Every segment intersects x=40 inside the witnessed obsidian strip, z in(0,1).
# Fraction extrema occur at x endpoint; Y extrema at body Y endpoints.
cross=[]
for x in [pose[0]-half,pose[0]+half]:
 for y in [pose[1],pose[1]+height]:
  for z in [pose[2]-half,pose[2]+half]:
   t=(40-x)/(crystal[0]-x)
   cross.append((40,y+t*(crystal[1]-y),z+t*(crystal[2]-z)))
assert min(p[1] for p in cross)>73 and max(p[1] for p in cross)<76
assert min(p[2] for p in cross)>0 and max(p[2] for p in cross)<1
eye=(pose[0],pose[1]+1.62,pose[2]);dist=math.hypot(max(0,abs(eye[0]-42.5)-1),max(0,77-eye[1],eye[1]-79),max(0,abs(eye[2]-.5)-1))
result={'source':'P4 actual8100/crystal_geometry.out','candidate_only':pose,'crystal':crystal,'cross_at_x40_y_range':[min(p[1] for p in cross),max(p[1] for p in cross)],'z_range':[min(p[2] for p in cross),max(p[2] for p in cross)],'all_player_AABB_segments_cross_witnessed_obsidian_strip':True,'eye_to_crystal_AABB_distance':dist,'predicted_raw_damage_if_exposure_zero':1,'physical_stance_attack_retreat_qualified':False}
print(json.dumps(result,indent=2))

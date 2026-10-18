"""Generate a short, fresh-validated LOW leg; does not run it."""
import json,sys
from pathlib import Path
root=Path('tasks/minecraft/team'); own=root/'p1/iter24'
a,b=map(int,sys.argv[1:3]); r=json.loads((root/'p4/iter23/WAYPOINT_LEADS.json').read_text())['low_feet_cells']
assert 0<=a<b<len(r)
assert all(sum(abs(u-v) for u,v in zip(x,y))==1 for x,y in zip(r,r[1:]))
name=f'low_{a}_{b}'
code=f'const WORK_MS={min(150000,(b-a)*1800+12000)};\n'+(own/'core.js').read_text()
code+='\nconst start='+json.dumps(r[a])+',cells='+json.dumps(r[a+1:b+1])+';\n'
code+='''try{live();if(bot.entity.position.distanceTo(new V(start[0]+.5,start[1],start[2]+.5))>.3||shell().some(c=>!c.full))throw Error('start changed');for(const a of cells)await step(new V(...a));console.log('SEGMENT_REACHED',JSON.stringify(state()));await close();}catch(e){console.log('PRIMARY_FAILURE',String(e));try{await close();}catch(f){console.log('RETENTION_FAILURE',String(f));}}finally{await finish();}\n'''
(own/(name+'.js')).write_text(code)
print(own/(name+'.js'),r[a],r[b])

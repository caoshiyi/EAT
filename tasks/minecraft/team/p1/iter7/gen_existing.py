"""Generate end-cap reuse to a fresh, affordable EXISTING room, skipping arbitrary intermediate closures."""
import argparse,json
from pathlib import Path
p=Path(__file__).parent;ap=argparse.ArgumentParser();ap.add_argument('x',type=int);ap.add_argument('y',type=int);ap.add_argument('z',type=int);ap.add_argument('--steps',type=int,default=100);ap.add_argument('--out',default='existing_batch.js');a=ap.parse_args();r=json.loads((p/'return_route.json').read_text())['path'];i=r.index([a.x,a.y,a.z]);path=r[i:i+a.steps+1];rear=r[i-1]
seed=(p/'reuse_caps_existing30.js').read_text();body=seed.split('let current=start;try{',1)[1];body='let current=start;try{'+body;body=body.replace('const rear=start.offset(-1,0,0);','const rear=new Vec3(...rearFoot);')
# Reserve against actual candidate state, including its incoming wall if that wall is currently full.
prefix='''
const candidates=[];for(let j=1;j<proposal.length;j++){const q=new Vec3(...proposal[j]),prev=new Vec3(...proposal[j-1]);if(!cold(q)||!full(bot.blockAt(q.offset(0,2,0))))continue;let need=cost(q);for(const y of[0,1])if(full(bot.blockAt(prev.offset(0,y,0))))need++;if(need<=mats()+4)candidates.push({j,need});}if(!candidates.length)throw Error('NO_AFFORDABLE_EXISTING_ENDPOINT');const chosen=candidates.at(-1),route=proposal.slice(0,chosen.j+1);console.log('CHOSEN_EXISTING_ENDPOINT',route.at(-1),'need',chosen.need,'steps',chosen.j,'rear',rearFoot);
'''
# Final-cost guard uses the simulated incoming-wall need chosen before any mutation.
body=body.replace("if(mats()<cost(new Vec3(...route.at(-1))))", "if(mats()<chosen.need)")
body=body.replace("'P1 EXISTING_ENDPOINT accepted'", "'P1 EXISTING_ENDPOINT accepted'")
body=body.replace("await ticks(8);console.log('ACTUAL_DEPART_RESERVE'","await go(front);trace.push(front);current=front;await ticks(8);await go(start);trace.push(start);current=start;console.log('ACTUAL_DEPART_RESERVE'")
body=body.replace('old113roof/sides/floorpreserved/endsOPEN','previousroomroof/sides/floorpreserved/endsOPEN')
s=(p/'shield_lib.js').read_text()+'\nconst proposal='+json.dumps(path)+';const rearFoot='+json.dumps(rear)+';\n'+body.replace('let current=start;try{','let current=start;try{'+prefix,1)
(p/a.out).write_text(s);print(json.dumps({'origin':path[0],'maxProposedEnd':path[-1],'maxSteps':len(path)-1,'rear':rear,'out':a.out}))

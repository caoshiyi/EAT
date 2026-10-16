// Host-only pure geometry fixture; does not create/connect/control a bot.
const assert=require('node:assert/strict'),fs=require('node:fs');
const root=process.env.EAT_ROOT,{Vec3}=require(root+'/tools/mc_arena/node_modules/vec3');
const source=fs.readFileSync(root+'/tasks/minecraft/team/p1/covered_advance8.js','utf8');
const fn=source.match(/function enclosed\(\)\{.*?return true\}/)?.[0];if(!fn)throw Error('function changed: inspect rather than silently test another shape');
const q=new Vec3(0,63,0),n=q.offset(-1,0,0),dir=new Vec3(-1,0,0),trace=[q],blocks=new Set(),key=p=>p.toString();
for(const p of[q,n]){blocks.add(key(p.offset(0,-1,0)));blocks.add(key(p.offset(0,2,0)));for(const dz of[-1,1])for(const dy of[0,1])blocks.add(key(p.offset(0,dy,dz)));}
for(const cap of[n.plus(dir),q.minus(dir)])for(const dy of[0,1])blocks.add(key(cap.offset(0,dy,0)));
const bot={blockAt:p=>blocks.has(key(p))};
function check(foot){return new Function('trace','nextFoot','envelopeFoot','q','dir','full','bot',fn+';return enclosed();')(trace,foot,foot,q,dir,x=>x,bot);}
assert.equal(check(q),false);assert.equal(check(n),true);
const faces=[n.offset(0,-1,0),n.offset(0,2,0),n.offset(0,0,1),n.offset(0,1,-1),n.plus(dir),n.plus(dir).offset(0,1,0),q.minus(dir)];
for(const p of faces){blocks.delete(key(p));assert.equal(check(n),false,'missing face '+key(p));blocks.add(key(p));}
console.log('PASS source predicate old/current cap FALSE, expanded/planned envelope TRUE, 7 independently removed outer faces FALSE. Synthetic geometry only; no gameplay safety proof.');

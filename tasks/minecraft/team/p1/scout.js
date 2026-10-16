const m=new Movements(bot); m.canDig=false; m.allow1by1towers=false; bot.pathfinder.setMovements(m);
const start=bot.entity.position.clone();
let timer;
try { await Promise.race([bot.pathfinder.goto(new goals.GoalXZ(Math.floor(start.x+80),Math.floor(start.z))),new Promise((_,r)=>{timer=setTimeout(()=>{bot.pathfinder.setGoal(null);r(new Error('bounded travel limit'));},22000)})]); }catch(e){console.log('travel',e.message)}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
console.log('position',bot.entity.position,'health',bot.health,'food',bot.food);
const names=['lava','chest','bell','hay_block','end_portal_frame','obsidian','gold_block','spawner'];
for (const n of names) {const ps=bot.findBlocks({matching:bot.registry.blocksByName[n].id,maxDistance:64,count:12});if(ps.length) console.log(n,ps.map(p=>p.toString()));}
console.log('animals',Object.values(bot.entities).filter(e=>['cow','pig','sheep','chicken','villager'].includes(e.name)).map(e=>({n:e.name,p:e.position.toString()})));

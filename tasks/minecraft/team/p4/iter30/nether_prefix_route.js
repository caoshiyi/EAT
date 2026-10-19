const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),began=Date.now(),target=v(18.5,8,274.5),stops=[];let dead=false,timer;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])});
const death=()=>{dead=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',death);
const health=()=>{if(bot.health<14){bot.pathfinder.setGoal(null);bot.clearControlStates();}};bot.on('health',health);
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('PREFIX_ROUTE_SOURCE',JSON.stringify(snap()));if(bot.game.dimension!=='the_nether'||bot.health!==20)throw Error('actual healthyNether source');
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=true;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;
for(const n of['water','lava','magma_block','fire','soul_fire'])if(bot.registry.blocksByName[n]&&m.blocksToAvoid?.add)m.blocksToAvoid.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);
for(let leg=0;leg<14;leg++){
if(dead||bot.health<14||Date.now()-began>150000||Date.now()>Date.parse('2026-10-19T07:10:00Z')||bot.game.dimension!=='the_nether')break;
if(bot.entity.position.distanceTo(target)<3){console.log('ACTUAL_TARGET_NEAR',JSON.stringify(snap()));break;}
const before=bot.entity.position.clone(),far=new goals.GoalNear(18,8,274,2),r=bot.pathfinder.getPathTo(m,far,650);
if(!r.path?.length)throw Error('no public pathprefix '+r.status);
const n=r.path[Math.min(18,r.path.length-1)],goal=new goals.GoalNear(Math.floor(n.x),Math.floor(n.y),Math.floor(n.z),1);
console.log('PUBLIC_PREFIX_PLAN',JSON.stringify({leg,status:r.status,len:r.path.length,first:r.path.slice(0,3).map(p=>({x:p.x,y:p.y,z:p.z})),selected:{x:n.x,y:n.y,z:n.z}}));
try{await Promise.race([bot.pathfinder.goto(goal),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('localprefix12s'));},12000))]);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
const moved=bot.entity.position.distanceTo(before);stops.push({leg,moved,...snap()});console.log('ACTUAL_PREFIX_STOP',JSON.stringify(stops.at(-1)));
if(moved<1)throw Error('no objectivephysicalprefixprogress');
if(leg%3===2)bot.chat('P4 actualNetherprefix progress '+JSON.stringify({p:bot.entity.position,hp:bot.health,Snow:bot.inventory.items().find(i=>i.name==='snowball')?.count||0})+'; pathprefixplans notEndarrival.');
}
}catch(e){console.log('PREFIX_ROUTE_FAILURE',String(e),JSON.stringify(snap()));}
finally{
bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',death);bot.removeListener('health',health);console.log('PREFIX_ROUTE_END',JSON.stringify({state:snap(),stops,elapsedMs:Date.now()-began,portals:bot.findBlocks({matching:b=>b.name==='nether_portal',maxDistance:24,count:12}),hazards:Object.values(bot.entities).filter(e=>['ghast','magma_cube','blaze','piglin','hoglin','skeleton','wither_skeleton'].includes(e.name)).map(e=>({n:e.name,p:e.position.clone(),d:e.position.distanceTo(bot.entity.position)})).filter(e=>e.d<14)}));
}
return snap();

const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),began=Date.now(),target=v(18.5,8,274.5);let timer;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])});
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),empty=q=>['air','cave_air'].includes(bot.blockAt(q)?.name);
let dead=false;const die=()=>{dead=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',die);
const paths=[];const update=r=>{if(paths.length<12)paths.push({at:new Date().toISOString(),status:r.status,len:r.path?.length,last:r.path?.length?{x:r.path.at(-1).x,y:r.path.at(-1).y,z:r.path.at(-1).z}:null});};bot.on('path_update',update);
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('NETHER_ROUTE_SOURCE',JSON.stringify(snap()));if(bot.game.dimension!=='the_nether'||bot.health!==20||bot.entity.position.distanceTo(v(4.5,65,3.5))>.2)throw Error('actual Nether source');
const north=v(4,65,2);if(!empty(north)||!empty(north.offset(0,1,0))||!full(north.offset(0,-1,0)))throw Error('actual North exitnotqualified');
await bot.lookAt(v(4.5,66.62,2.5),true);bot.setControlState('forward',true);for(let k=0;k<20&&bot.entity.position.z>2.62;k++)await bot.waitForTicks(1);bot.clearControlStates();await bot.waitForTicks(4);console.log('ACTUAL_NETHER_EXIT',JSON.stringify(snap()));
if(!bot.entity.position.floored().equals(north)||!bot.entity.onGround)throw Error('nativeexitpost');
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=true;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;
for(const n of['lava','water'])if(bot.registry.blocksByName[n]&&m.blocksToAvoid?.add)m.blocksToAvoid.add(bot.registry.blocksByName[n].id);
bot.pathfinder.setMovements(m);await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_sword'),'hand');
let last=Date.now();const health=()=>{if(bot.health<14||dead){bot.pathfinder.setGoal(null);bot.clearControlStates();}};bot.on('health',health);
try{
await Promise.race([bot.pathfinder.goto(new goals.GoalNear(18,8,274,2)),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('70s routepilot budget'));},70000))]);
}finally{clearTimeout(timer);bot.removeListener('health',health);}
console.log('ACTUAL_NETHER_TARGET_ARRIVAL',JSON.stringify(snap()));
}catch(e){console.log('NETHER_ROUTE_FAILURE',String(e),JSON.stringify(snap()));}
finally{
bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',die);bot.removeListener('path_update',update);await bot.waitForTicks(4);
console.log('NETHER_ROUTE_END',JSON.stringify({state:snap(),planner:paths,elapsedMs:Date.now()-began,portals:bot.findBlocks({matching:b=>b.name==='nether_portal',maxDistance:24,count:10}),hazards:Object.values(bot.entities).filter(e=>['ghast','magma_cube','blaze','piglin','hoglin','skeleton','wither_skeleton'].includes(e.name)).map(e=>({n:e.name,p:e.position.clone(),d:e.position.distanceTo(bot.entity.position)})).filter(e=>e.d<16)}));
}
return snap();

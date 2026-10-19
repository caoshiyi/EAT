const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),began=Date.now(),startHp=bot.health;let death=false,timer;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),time:bot.time.timeOfDay});
const died=()=>{death=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',died);
const guard=()=>{if(death||bot.health<16||bot.game.dimension!=='overworld'||Date.now()-began>110000)throw Error('life/health/budget');};
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];m.maxDropDown=1;m.liquidCost=Infinity;for(const n of ['water','lava'])if(bot.registry.blocksByName[n]&&m.blocksToAvoid?.add)m.blocksToAvoid.add(bot.registry.blocksByName[n].id);if(Array.isArray(m.exclusionAreasStep))m.exclusionAreasStep.push(b=>['water','lava'].includes(b.name)||b.position.x<3?Infinity:0);bot.pathfinder.setMovements(m);
async function go(g){guard();let timer;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('navigation budget25s'));},25000))]);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}guard();}
async function see(q){for(const a of [[.5,.5,.5],[.5,.01,.5],[.5,.99,.5],[.01,.5,.5],[.99,.5,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const b=bot.blockAtCursor(4.5);if(b?.position.equals(q))return b;}throw Error('not current visible '+q);}
try{
console.log('ACQUIRE_SOURCE',JSON.stringify(snap()));if(bot.entity.position.distanceTo(v(10.208560812,70,-36.5))>.2||bot.health<16)throw Error('source');
let logs=0;
for(let i=0;i<3;i++){
guard();const qs=bot.findBlocks({matching:b=>b.name==='spruce_log',maxDistance:24,count:20}).filter(q=>q.y<=76&&q.x>=5).sort((a,b)=>a.distanceTo(bot.entity.position)-b.distanceTo(bot.entity.position));
if(!qs.length)throw Error('no loaded log');
const q=qs[0];await go(new goals.GoalNear(q.x,q.y,q.z,2));guard();await see(q);await bot.unequip('hand');await bot.dig(bot.blockAt(q),true,'raycast');await bot.waitForTicks(5);
await bot.waitForTicks(10);if(!bot.inventory.items().some(i=>i.name==='spruce_log')){await go(new goals.GoalNear(q.x,q.y,q.z,1));await bot.waitForTicks(10);}logs=bot.inventory.items().filter(i=>i.name==='spruce_log').reduce((s,i)=>s+i.count,0);console.log('ACTUAL_LOG_RECEIPT',JSON.stringify({logs,state:snap()}));if(logs>=1)break;
}
console.log('ACQUIRE_LOG_END',JSON.stringify(snap()));
}catch(e){console.log('ACQUIRE_FAILURE',String(e));}
finally{bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',died);console.log('ACQUIRE_END',JSON.stringify(snap()));}
return snap();

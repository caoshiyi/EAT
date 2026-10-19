const {Vec3}=require('vec3');const from=bot.entity.position.clone(),begin=Date.now();let timer,dead=false;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,velocity:bot.entity.velocity,inv:bot.inventory.items().map(i=>[i.name,i.count])});
const stop=()=>{bot.pathfinder.setGoal(null);bot.clearControlStates();},death=()=>{dead=true;stop();};bot.on('death',death);
try{
stop();await bot.waitForTicks(4);console.log('SOURCE',JSON.stringify(snap()));if(bot.game.dimension!=='overworld'||bot.health<15||!bot.entity.onGround)throw Error('source');
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.maxDropDown=1;m.infiniteLiquidDropdownDistance=false;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];
for(const n of['lava','water','powder_snow','sweet_berry_bush']){const b=bot.registry.blocksByName[n];if(b)m.blocksToAvoid.add(b.id);}m.exclusionAreasStep.push(b=>['water','lava','powder_snow','sweet_berry_bush'].includes(b.name)?Infinity:0);bot.pathfinder.setMovements(m);
const tx=Number(global.routeX??18),tz=Number(global.routeZ??-16),goal=new goals.GoalNearXZ(tx,tz,2);
console.log('TARGET',JSON.stringify({tx,tz}));
const health=()=>{if(bot.health<15)stop();};bot.on('health',health);
try{await Promise.race([bot.pathfinder.goto(goal),new Promise((_,reject)=>timer=setTimeout(()=>{stop();reject(Error('20s leg budget'));},20000))]);}finally{clearTimeout(timer);bot.removeListener('health',health);}
console.log('ARRIVAL',JSON.stringify(snap()));
}catch(e){console.log('FAIL',String(e));}finally{clearTimeout(timer);stop();bot.removeListener('death',death);await bot.waitForTicks(10);const q=bot.entity.position.floored();console.log('END',JSON.stringify({...snap(),moved:from.distanceTo(bot.entity.position),elapsed:Date.now()-begin,dead,floor:bot.blockAt(q.offset(0,-1,0))?.name,feet:bot.blockAt(q)?.name,head:bot.blockAt(q.offset(0,1,0))?.name,hazards:Object.values(bot.entities).filter(e=>['skeleton','creeper','zombie','spider'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<18).map(e=>({n:e.name,p:e.position,d:e.position.distanceTo(bot.entity.position)}))}));}
return snap();

// BOUNDED 120s attack-only guard. Candidate: action counters are diagnostics, not proof of mob damage.
// Does not navigate, aim, equip, block arrows, or handle creepers. Choose own weapon before installing.
if(global.p3guard)clearInterval(global.p3guard);global.p3guardHits=global.p3guardHits||[];
const guardHandle=setInterval(()=>{try{const e=Object.values(bot.entities).filter(e=>['zombie','zombie_villager','skeleton','spider'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<3).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];if(e){bot.attack(e);global.p3guardHits.push({t:Date.now(),n:e.name,id:e.id,d:e.position.distanceTo(bot.entity.position),hp:bot.health});if(global.p3guardHits.length>40)global.p3guardHits.shift();}}catch(e){console.log('guard error',e.message);}},650);global.p3guard=guardHandle;
setTimeout(()=>{clearInterval(guardHandle);if(global.p3guard===guardHandle)global.p3guard=null;},120000);
const {Vec3}=require('vec3');const m=new Movements(bot);m.canDig=true;m.allow1by1towers=false;m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;for(const n of ['chest','crafting_table','furnace'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2000;
const go=async(g,ms)=>{let t;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('bound'))},ms))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates()}};
m.canDig=false;m.scafoldingBlocks=[];m.maxDropDown=3;bot.pathfinder.setMovements(m);await go(new goals.GoalNear(6,66,80,1),8000);
for(const x of [6,7]){const d=bot.blockAt(new Vec3(x,67,81));if(d?.name.endsWith('_door')&&d.position.distanceTo(bot.entity.position)<5&&!d.getProperties().open)await bot.activateBlock(d)}
await go(new goals.GoalBlock(6,67,82),8000);
console.log('inside?',bot.entity.position,bot.health,bot.food);
if(bot.entity.position.x<8&&bot.entity.position.z>81&&bot.entity.position.z<84)for(const x of [6,7]){const d=bot.blockAt(new Vec3(x,67,81));if(d?.name.endsWith('_door')&&d.getProperties().open)await bot.activateBlock(d)}
console.log('safeend',bot.entity.position,'feet',bot.blockAt(bot.entity.position).name,'doors',[6,7].map(x=>bot.blockAt(new Vec3(x,67,81)).getProperties()));

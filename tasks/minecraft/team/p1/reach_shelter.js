const {Vec3}=require('vec3');const m=new Movements(bot);m.canDig=true;m.allow1by1towers=false;m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;for(const n of ['chest','crafting_table','furnace'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2000;
const go=async(g,ms)=>{let t;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('bound'))},ms))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates()}};
for(let k=0;k<28;k++){const p=bot.entity.position.clone();await go(new goals.GoalXZ(16,Math.min(78,Math.floor(p.z+8))),3000);console.log(k,bot.entity.position.toString(),bot.health);if(bot.entity.position.z>75)break;}
m.canDig=false;m.scafoldingBlocks=[];m.maxDropDown=3;bot.pathfinder.setMovements(m);await go(new goals.GoalNear(6,66,80,1),8000);
for(const x of [6,7]){const d=bot.blockAt(new Vec3(x,67,81));if(d?.name.endsWith('_door')&&d.position.distanceTo(bot.entity.position)<5&&!d.getProperties().open)await bot.activateBlock(d)}
await go(new goals.GoalBlock(6,67,82),8000);
console.log('inside?',bot.entity.position,bot.health,bot.food);
if(bot.entity.position.x<8&&bot.entity.position.z>81&&bot.entity.position.z<84)for(const x of [6,7]){const d=bot.blockAt(new Vec3(x,67,81));if(d?.name.endsWith('_door')&&d.getProperties().open)await bot.activateBlock(d)}
console.log('safeend',bot.entity.position,'feet',bot.blockAt(bot.entity.position).name,'doors',[6,7].map(x=>bot.blockAt(new Vec3(x,67,81)).getProperties()));

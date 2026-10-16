const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;m.infiniteLiquidDropdownDistance=false;for(const n of ['water','lava'])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);for(const n of ['sand','gravel'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);m.allowParkour=false;for(const n of ['crafting_table','furnace','chest'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2500;
if(bot.entity.position.x>5&&bot.entity.position.x<8&&bot.entity.position.z>81&&bot.entity.position.z<84){console.log('already inside camp',bot.entity.position.toString());return;}
const end=Date.now()+27000;for(let n=0;n<4&&Date.now()<end;n++){
 const p=bot.entity.position.clone();let x=8;const z=Math.min(87,Math.floor(p.z)+10);let y=null;
 for(let h=90;h>=60;h--){const b=bot.blockAt(new Vec3(x,h,z));if(b&&['grass_block','dirt','stone','sand','gravel','snow_block','ice','packed_ice'].includes(b.name)){y=h+1;break;}}
 if(y===null)throw Error('no known surface');console.log('target',x,y,z);
 const timer=setTimeout(()=>bot.pathfinder.setGoal(null),7500);try{await bot.pathfinder.goto(new goals.GoalNear(x,y,z,2));}catch(e){console.log('path',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);}
 console.log('pos',bot.entity.position.toString(),'health',bot.health,'food',bot.food);if(p.distanceTo(bot.entity.position)<.5){console.log('NO PROGRESS, stop');break;}if(bot.health<12||bot.entity.position.z>84)break;
}
if(bot.entity.position.z>77){
const table=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:18});if(table){
console.log('camp entry');const doors=[new Vec3(6,67,81),new Vec3(7,67,81)];
const safe=new Movements(bot);safe.canDig=false;safe.maxDropDown=1;safe.blocksToAvoid.add(bot.registry.blocksByName.lava.id);safe.blocksToAvoid.add(bot.registry.blocksByName.water.id);bot.pathfinder.setMovements(safe);
for(const q of doors){const d=bot.blockAt(q);if(d.name.endsWith('_door')&&!d.getProperties().open&&q.distanceTo(bot.entity.position)<5){await bot.activateBlock(d);await bot.waitForTicks(4);}}
let timer=setTimeout(()=>bot.pathfinder.setGoal(null),6000);try{await bot.pathfinder.goto(new goals.GoalNear(6,67,80,1));}catch(e){console.log('entry approach',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);await bot.waitForTicks(4);}
for(const q of doors){const d=bot.blockAt(q);if(d.name.endsWith('_door')&&!d.getProperties().open&&q.distanceTo(bot.entity.position)<5){await bot.activateBlock(d);await bot.waitForTicks(4);}}
timer=setTimeout(()=>bot.pathfinder.setGoal(null),6000);try{await bot.pathfinder.goto(new goals.GoalNear(6,67,82,.7));}catch(e){console.log('inside',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);}
if(bot.entity.position.z>81&&bot.entity.position.z<84&&bot.entity.position.x>5&&bot.entity.position.x<8){for(const q of doors){const d=bot.blockAt(q);if(d.name.endsWith('_door')&&d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(4);}}}
console.log('rest',bot.entity.position.toString(),bot.entity.onGround,bot.blockAt(bot.entity.position.offset(0,1,0)).name,bot.health);
}}

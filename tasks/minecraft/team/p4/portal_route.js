bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;m.allowParkour=false;for(const n of ['crafting_table','furnace','chest'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1600;
const end=Date.now()+26000;for(let i=0;i<6&&Date.now()<end;i++){
const p=bot.entity.position;const x=Math.max(8,Math.min(10,p.x));const z=Math.min(87,p.z+10);const y=Math.max(63,Math.min(70,Math.floor(p.y)));
const timer=setTimeout(()=>bot.pathfinder.setGoal(null),6500);try{await bot.pathfinder.goto(new goals.GoalNear(x,y,z,2));}catch(e){console.log('path',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);}
console.log('position',bot.entity.position.toString(),'health',bot.health,'food',bot.food);if(bot.health<12||bot.entity.position.z>85)break;
}

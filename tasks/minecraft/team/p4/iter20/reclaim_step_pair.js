const V=require('vec3').Vec3,m=new Movements(bot),hp=bot.health,cuts=[];m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
try{await bot.pathfinder.goto(new goals.GoalBlock(140,-36,2234));bot.pathfinder.setGoal(null);bot.clearControlStates();
 for(const z of [2235,2236]){const p=new V(140,-36,z),b=bot.blockAt(p);if(b.name!=='cobbled_deepslate')throw Error('test block changed');await bot.lookAt(p.offset(.35,.65,.015),true);await bot.waitForTicks(2);const h=bot.blockAtCursor(4.5);if(!h||!h.position.equals(p))throw Error('reclaim not visible');await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');await bot.dig(b,false,'raycast');await bot.waitForTicks(3);cuts.push({p,actual:bot.blockAt(p).name});}
 await bot.pathfinder.goto(new goals.GoalBlock(140,-36,2236));await bot.waitForTicks(12);await bot.pathfinder.goto(new goals.GoalBlock(140,-36,2234));
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
return {cuts,p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed}))};

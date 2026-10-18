const V=require('vec3').Vec3,m=new Movements(bot),hp=bot.health;
m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);const observations=[];
try{
 if(bot.blockAt(new V(140,-36,2232)).name!=='crafting_table')throw Error('table changed');
 for(const p of [[140,-36,2231],[140,-35,2232],[140,-36,2231]]){await bot.pathfinder.goto(new goals.GoalBlock(...p));bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(5);const r={target:p,p:bot.entity.position.clone(),hp:bot.health,ground:bot.entity.onGround,vel:bot.entity.velocity.clone(),support:bot.blockAt(bot.entity.position.floored().offset(0,-1,0)).name};observations.push(r);console.log('ACTUAL',JSON.stringify(r));if(bot.health<hp||!r.ground||Math.abs(r.p.y-p[1])>.05)throw Error('height/health not qualified');}
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
return {observations,hp:bot.health,p:bot.entity.position,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count})),effect:'normal adjacent oneblock rise then return; no block/inventory mutation'};

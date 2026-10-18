bot.pathfinder.setGoal(null);bot.clearControlStates();bot.stopDigging();
const out=[];for(let n=0;n<6;n++){out.push({t:n*10,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,goal:bot.pathfinder.goal,controls:{...bot.controlState}});await bot.waitForTicks(10);}
return {out,foes:Object.values(bot.entities).filter(e=>e.type==='mob'&&e.position.distanceTo(bot.entity.position)<12).map(e=>({n:e.name,p:e.position})),clock:bot.time.timeOfDay};

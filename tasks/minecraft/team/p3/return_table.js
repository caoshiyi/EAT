const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2500;
try{await bot.pathfinder.goto(new goals.GoalNear(-3,58,-41,1));}catch(e){console.log('lower exit',e.message);bot.pathfinder.stop();}
console.log('at',bot.entity.position);
try{await bot.pathfinder.goto(new goals.GoalNear(12,70,-36,2));}catch(e){console.log('table path',e.message);bot.pathfinder.stop();}
console.log('coal',bot.findBlocks({matching:bot.registry.blocksByName.coal_ore.id,maxDistance:12,count:20}));return {p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

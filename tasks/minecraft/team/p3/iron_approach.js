const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2500;await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');
try{await bot.pathfinder.goto(new goals.GoalNear(-3,62,-42,2));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}
console.log('iron',bot.findBlocks({matching:b=>b.name==='iron_ore',maxDistance:20,count:30}));return {p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

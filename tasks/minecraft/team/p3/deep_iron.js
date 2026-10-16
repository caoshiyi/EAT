const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2200;
await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');
try{await bot.pathfinder.goto(new goals.GoalNear(-4,50,-47,2));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}
console.log('near iron',bot.findBlocks({matching:bot.registry.blocksByName.iron_ore.id,maxDistance:10,count:25}));return {p:bot.entity.position,health:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count])};

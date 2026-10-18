bot.clearControlStates();
bot.pathfinder.setGoal(null);
return {pos:bot.entity.position,dimension:bot.game.dimension,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>({name:i.name,count:i.count,slot:i.slot,durabilityUsed:i.durabilityUsed})),entities:Object.values(bot.entities).filter(e=>e.position.distanceTo(bot.entity.position)<12).map(e=>({id:e.id,name:e.name,type:e.type,pos:e.position})),nearBlocks:bot.findBlocks({matching:b=>b.name!=='air',maxDistance:4,count:25}).map(p=>({pos:p,name:bot.blockAt(p).name}))};

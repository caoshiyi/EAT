const move=new Movements(bot);move.canDig=false;bot.pathfinder.setMovements(move);
for(let i=0;i<5;i++){
 const b=bot.findBlock({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:40});if(!b)break;
 await bot.pathfinder.goto(new goals.GoalGetToBlock(b.position.x,b.position.y,b.position.z));await bot.dig(b);await bot.waitForTicks(8);
}
console.log(bot.inventory.items().map(i=>[i.name,i.count]));

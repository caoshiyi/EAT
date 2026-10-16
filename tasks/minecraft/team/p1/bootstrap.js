const log=bot.findBlock({matching:b=>b.name.endsWith('_log'),maxDistance:20});
await bot.pathfinder.goto(new goals.GoalNear(log.position.x,log.position.y,log.position.z,2));
for(let i=0;i<5;i++){
 const b=bot.findBlock({matching:b=>b.name.endsWith('_log'),maxDistance:6});
 if(!b)break; await bot.dig(b); await bot.waitForTicks(8);
}
await bot.waitForTicks(20);
console.log(bot.inventory.items().map(i=>({name:i.name,count:i.count})));
const logs=bot.inventory.items().find(i=>i.name.endsWith('_log'));
if(logs) await bot.craft(bot.recipesFor(bot.registry.itemsByName.spruce_planks.id,null,1,null)[0],logs.count,null);
await bot.craft(bot.recipesFor(bot.registry.itemsByName.crafting_table.id,null,1,null)[0],1,null);
await bot.craft(bot.recipesFor(bot.registry.itemsByName.stick.id,null,1,null)[0],2,null);
console.log('kit',bot.inventory.items().map(i=>({name:i.name,count:i.count})));

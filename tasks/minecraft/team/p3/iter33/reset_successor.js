const V=bot.entity.position.constructor;bot.clearControlStates();bot.pathfinder.setGoal(null);
console.log('NEXT_SOURCE',bot.entity.position,bot.health,bot.food,bot.entity.onGround);
const c=await bot.openChest(bot.blockAt(new V(7,68,82)));console.log('RETAINED_BANK',c.containerItems().map(i=>[i.name,i.count]));for(const n of ['dirt','sand']){const i=c.containerItems().find(i=>i.name===n);if(i)await c.withdraw(i.type,null,i.count);}c.close();
const foot=bot.blockAt(new V(5,67,82));if(foot.name==='air'){await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');await bot.placeBlock(bot.blockAt(new V(5,67,83)),new V(0,0,-1));await bot.waitForTicks(8);}
if(bot.blockAt(new V(5,68,82)).name==='air'){await bot.equip(bot.inventory.items().find(i=>i.name==='sand'),'hand');await bot.placeBlock(bot.blockAt(new V(5,67,82)),new V(0,1,0));await bot.waitForTicks(15);}
console.log('END',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]),[[5,67,82],[5,68,82],[6,67,83],[7,67,83],[6,66,82],[6,69,82]].map(a=>[a,bot.blockAt(new V(...a))?.name]));

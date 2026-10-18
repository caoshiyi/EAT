console.log('START',bot.entity.position,bot.health,bot.food);
const id=bot.registry.blocksByName.sweet_berry_bush.id;
for(const p of bot.findBlocks({matching:id,maxDistance:4,count:10})){const b=bot.blockAt(p);console.log('SOURCE',p,b.getProperties(),bot.canSeeBlock(b));if(Number(b.getProperties().age)<2||!bot.canSeeBlock(b)||p.distanceTo(bot.entity.position)>4.5)continue;await bot.unequip('hand');await bot.activateBlock(b);await bot.waitForTicks(12);console.log('HARVEST_AFTER',p,bot.blockAt(p)?.getProperties(),bot.inventory.items().map(i=>[i.name,i.count]));if(bot.inventory.items().some(i=>i.name==='sweet_berries'))break;}
const food=bot.inventory.items().find(i=>i.name==='sweet_berries');if(!food)return 'NO_RECEIPT';
await bot.equip(food,'hand');console.log('BEFORE_CONSUME',bot.health,bot.food,food.count);await bot.consume();await bot.waitForTicks(20);console.log('AFTER_CONSUME',bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));

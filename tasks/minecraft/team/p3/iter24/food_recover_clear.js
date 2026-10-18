console.log('START',bot.entity.position,bot.health,bot.food);
for(let i=0;i<2&&bot.food<20;i++){let f=bot.inventory.items().find(i=>i.name==='sweet_berries');if(!f)break;await bot.equip(f,'hand');await bot.consume();console.log('EAT',bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));}
await bot.unequip('hand');
for(const p of bot.findBlocks({matching:bot.registry.blocksByName.sweet_berry_bush.id,maxDistance:4,count:16})){let b=bot.blockAt(p);if(!bot.canSeeBlock(b)||p.distanceTo(bot.entity.position)>4)continue;if(Number(b.getProperties().age)>=2){await bot.activateBlock(b);await bot.waitForTicks(3);console.log('HARVEST',p,bot.blockAt(p)?.getProperties());}b=bot.blockAt(p);if(b?.name==='sweet_berry_bush'&&bot.canSeeBlock(b)){await bot.dig(b,false,'raycast');console.log('CLEAR',p,bot.blockAt(p)?.name);}}
await bot.waitForTicks(20);console.log('END',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));

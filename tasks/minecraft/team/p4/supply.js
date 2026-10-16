bot.pathfinder.stop();
const table=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:5});
const craft=async(n,c)=>{const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('no recipe '+n);await bot.craft(r,c,table)};
await craft('stick',1);await craft('wooden_pickaxe',1);
const p=bot.players.p3?.entity;if(p){await bot.lookAt(p.position.offset(0,1,0));await bot.toss(bot.registry.itemsByName.wooden_pickaxe.id,null,1);bot.chat('p3 wooden pick tossed toward you; communal table (12,70,-36). Stone drops at (11,69,-40), path there to collect.');}
console.log(bot.inventory.items().map(i=>[i.name,i.count]));

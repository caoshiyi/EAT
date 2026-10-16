bot.pathfinder.stop();console.log('pos',bot.entity.position.toString());
for(const n of ['iron_ore','coal_ore','gravel','sweet_berry_bush','lava','crafting_table']){console.log(n,bot.findBlocks({matching:bot.registry.blocksByName[n].id,maxDistance:48,count:12}).map(p=>p.toString()));}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

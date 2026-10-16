const near = bot.findBlocks({matching: b => /log$|iron_ore|coal_ore|crafting_table|stone$|lava|water/.test(b.name), maxDistance:48,count:100});
console.log(JSON.stringify(near.map(p=>({name:bot.blockAt(p).name,p})).slice(0,65)));
console.log('entities',Object.values(bot.entities).map(e=>({name:e.name,type:e.type,p:e.position})).slice(0,30));
return {pos:bot.entity.position, inv:bot.inventory.items().map(i=>[i.name,i.count])};

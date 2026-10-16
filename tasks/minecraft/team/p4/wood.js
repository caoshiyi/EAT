bot.pathfinder.stop();console.log('start',bot.entity.position.toString());
for(let n=0;n<6;n++){
 const bs=bot.findBlocks({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:5,count:30}).map(p=>bot.blockAt(p)).filter(b=>bot.canDigBlock(b)).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position));
 if(!bs.length)break; console.log('dig',bs[0].position.toString());await bot.dig(bs[0]);await bot.waitForTicks(12);
}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

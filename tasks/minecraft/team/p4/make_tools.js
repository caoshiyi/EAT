bot.pathfinder.setGoal(null);bot.clearControlStates();
for(let n=0;n<5;n++){
 const bs=bot.findBlocks({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:5,count:30}).map(p=>bot.blockAt(p)).filter(b=>bot.canDigBlock(b));if(!bs.length)break;await bot.dig(bs[0]);await bot.waitForTicks(10);
}
console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));
const log=bot.inventory.items().find(i=>i.name==='spruce_log');if(log){const r=bot.recipesFor(bot.registry.itemsByName.spruce_planks.id,null,1,null)[0];await bot.craft(r,log.count,null);}
console.log('drops',Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<8).map(e=>({p:e.position.toString(),name:e.getDroppedItem?.()?.name})));

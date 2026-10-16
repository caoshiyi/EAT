bot.pathfinder.stop();
for(let k=0;k<4;k++){
const ps=bot.findBlocks({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:5,count:40});
const b=ps.map(p=>bot.blockAt(p)).find(b=>bot.canDigBlock(b));
if(!b)break;const p=b.position.clone(); console.log('dig',p);await bot.dig(b);console.log('after',bot.blockAt(p).name);await bot.waitForTicks(5);
}
console.log('drops',Object.values(bot.entities).filter(e=>e.name==='item').map(e=>({p:e.position,id:e.id})));
return bot.inventory.items().map(i=>[i.name,i.count]);

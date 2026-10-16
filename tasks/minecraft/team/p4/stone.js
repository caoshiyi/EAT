bot.pathfinder.stop();await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_pickaxe'),'hand');
for(let i=0;i<12;i++){
 const bs=bot.findBlocks({matching:bot.registry.blocksByName.stone.id,maxDistance:5,count:100}).map(p=>bot.blockAt(p)).filter(b=>bot.canDigBlock(b)&&b.position.y>=bot.entity.position.y-1&&b.position.distanceTo(bot.entity.position)>1.6).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position));
 if(!bs.length)break;console.log('dig',bs[0].position.toString());await bot.dig(bs[0]);await bot.waitForTicks(4);
}
const m=new Movements(bot);m.canDig=false;bot.pathfinder.setMovements(m);
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));console.log('items',Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<8).map(e=>e.position.toString()));

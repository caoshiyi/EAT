bot.pathfinder.setGoal(null);const m=new Movements(bot);m.canDig=true;m.maxDropDown=3;for(const n of ['crafting_table','furnace','chest'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=5000;
await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');
const end=Date.now()+27000;
for(let n=0;n<8&&Date.now()<end;n++){
 const blocks=bot.findBlocks({matching:bot.registry.blocksByName.coal_ore.id,maxDistance:20,count:20}).map(p=>bot.blockAt(p)).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position));
 let b=blocks.find(b=>bot.canDigBlock(b));if(!b&&blocks.length){b=blocks[0];try{await bot.pathfinder.goto(new goals.GoalNear(b.position.x,b.position.y,b.position.z,2));}catch(e){console.log('path',e.message);bot.pathfinder.setGoal(null);}if(!bot.canDigBlock(b))break;}if(!b)break;
 const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe');if(!pick)throw Error('pick missing');await bot.equip(pick,'hand');const p=b.position.clone();await bot.dig(b);console.log('dug',p.toString(),bot.blockAt(p).name);await bot.waitForTicks(4);
 const drops=Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<7&&e.getDroppedItem?.()?.name==='coal');
 for(const d of drops){try{await bot.pathfinder.goto(new goals.GoalNear(d.position.x,d.position.y,d.position.z,0.6));}catch(e){bot.pathfinder.setGoal(null);}}
}
bot.pathfinder.setGoal(null);console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

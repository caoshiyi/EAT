bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);
const bs=bot.findBlocks({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:5,count:20}).map(p=>bot.blockAt(p)).filter(b=>b.position.y>=bot.entity.position.y-1&&bot.entity.position.distanceTo(b.position)<4.5&&bot.canDigBlock(b)).sort((a,b)=>a.position.y-b.position.y);
for(const b of bs.slice(0,4)){console.log('dig',b.position);const axe=bot.inventory.items().find(i=>i.name==='wooden_axe');if(axe)await bot.equip(axe,'hand');await bot.dig(b);await bot.waitForTicks(8);if(bot.health<10)break;}
const drops=Object.values(bot.entities).filter(e=>e.name==='item'&&e.getDroppedItem?.()?.name==='spruce_log'&&bot.entity.position.distanceTo(e.position)<8);
const m=new Movements(bot);m.canDig=false;m.maxDropDown=1;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
for(const d of drops){const t=setTimeout(()=>bot.pathfinder.setGoal(null),2500);try{await bot.pathfinder.goto(new goals.GoalNear(d.position.x,d.position.y,d.position.z,0.6));}catch(e){console.log(e.message);}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates();}}
await bot.waitForTicks(8);console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]),'p',bot.entity.position,'health',bot.health);

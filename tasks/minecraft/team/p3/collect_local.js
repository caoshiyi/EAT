const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
const ds=Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<9).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position));
for(const d of ds.slice(0,6)){if(!bot.entities[d.id])continue;console.log('collect',d.getDroppedItem?.()?.name,d.position);try{await bot.pathfinder.goto(new goals.GoalNear(d.position.x,d.position.y,d.position.z,0.6));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}await bot.waitForTicks(7);}
return bot.inventory.items().map(i=>[i.name,i.count]);

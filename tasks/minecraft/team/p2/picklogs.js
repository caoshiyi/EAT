bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);
const ds=Object.values(bot.entities).filter(e=>e.name==='item'&&e.getDroppedItem?.()?.name==='spruce_log'&&bot.entity.position.distanceTo(e.position)<10).sort((a,b)=>bot.entity.position.distanceTo(a.position)-bot.entity.position.distanceTo(b.position));
console.log('drops',ds.map(e=>({p:e.position,c:e.getDroppedItem?.()?.count})));
for(const d of ds.slice(0,3)){const p=d.position.clone();await bot.lookAt(p.offset(0,1.6,0),true);bot.setControlState('jump',true);await bot.waitForTicks(4);bot.setControlState('forward',true);await bot.waitForTicks(Math.min(20,Math.ceil(bot.entity.position.distanceTo(p)*5)));bot.clearControlStates();await bot.waitForTicks(6);}
console.log('p',bot.entity.position,'inv',bot.inventory.items().map(i=>[i.name,i.count]),'health',bot.health);

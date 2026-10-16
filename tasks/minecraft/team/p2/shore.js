bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));
console.log('drops',Object.values(bot.entities).filter(e=>e.name==='item'&&bot.entity.position.distanceTo(e.position)<10).map(e=>({pos:e.position,item:e.getDroppedItem?.()?.name})));
await bot.lookAt(bot.entity.position.offset(3,0,-2),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(70);bot.clearControlStates();console.log('p',bot.entity.position);

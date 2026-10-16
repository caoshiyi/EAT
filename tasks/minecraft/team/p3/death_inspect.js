const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();
console.log('BODY',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));console.log('TIME',bot.time.timeOfDay);
console.log('ENTITIES',Object.values(bot.entities).filter(e=>e.position&&e.position.distanceTo(bot.entity.position)<14).map(e=>[e.id,e.name,e.position,e.getDroppedItem?.()?.name,e.getDroppedItem?.()?.count]));
console.log('DOORS',[6,7].map(x=>bot.blockAt(new Vec3(x,67,81)).getProperties()));

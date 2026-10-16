const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.equip(bot.inventory.items().find(i=>i.name==='spruce_boat'),'hand');await bot.lookAt(new Vec3(6.5,62.8,124.5),true);bot.activateItem();await bot.waitForTicks(15);bot.deactivateItem();
console.log('boats',Object.values(bot.entities).filter(e=>e.name?.includes('boat')).map(e=>({id:e.id,name:e.name,pos:e.position})));
const boat=Object.values(bot.entities).find(e=>e.name?.includes('boat')&&bot.entity.position.distanceTo(e.position)<6);
if(boat){bot.mount(boat);await bot.waitForTicks(10);console.log('mounted',!!bot.vehicle);if(bot.vehicle){await bot.lookAt(bot.entity.position.offset(0,0,20),true);bot.moveVehicle(0,1);await bot.waitForTicks(60);bot.moveVehicle(0,0);console.log('after',bot.entity.position, 'vehicle',bot.vehicle?.position);}}
console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));

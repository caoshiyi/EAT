const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);
const swim=async(x,z,max)=>{for(let k=0;k<max;k+=4){const p=bot.entity.position;const d=Math.hypot(p.x-x,p.z-z);if(d<0.75)break;await bot.lookAt(new Vec3(x,p.y+0.2,z));bot.setControlState('jump',true);bot.setControlState('forward',true);await bot.waitForTicks(4);if(bot.health<5)break}bot.setControlState('forward',false);console.log('waypoint',bot.entity.position.toString(),bot.health,bot.oxygenLevel)};
console.log('start',bot.entity.position.toString());console.log('drops',Object.values(bot.entities).filter(e=>e.name==='item'&&Math.hypot(e.position.x-135.3,e.position.z-35.7)<12).map(e=>[e.position.toString(),e.getDroppedItem()?.name]));
await swim(135.3,35.7,340);await bot.waitForTicks(10);
console.log('collected',bot.inventory.items().map(i=>[i.name,i.count]));
for(const e of Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5).slice(0,4)){await swim(e.position.x,e.position.z,40);await bot.waitForTicks(5)}
await swim(100.5,40.5,400);bot.clearControlStates();await bot.waitForTicks(10);
console.log('end',bot.entity.position.toString(),bot.health,bot.food,'feet',bot.blockAt(bot.entity.position).name,'under',bot.blockAt(bot.entity.position.offset(0,-1,0)).name);console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

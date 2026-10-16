bot.pathfinder.setGoal(null);bot.clearControlStates();const {Vec3}=require('vec3');await bot.lookAt(new Vec3(8.5,64,127.5),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(65);bot.clearControlStates();console.log('p',bot.entity.position);
let bs=bot.findBlocks({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:5,count:12}).map(p=>bot.blockAt(p));for(const b of bs.slice(0,2)){if(bot.canDigBlock(b)){console.log('dig',b.position);await bot.dig(b);}}
console.log('drops',Object.values(bot.entities).filter(e=>e.name==='item'&&bot.entity.position.distanceTo(e.position)<10).map(e=>({pos:e.position,item:e.getDroppedItem?.()?.name})));
console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));

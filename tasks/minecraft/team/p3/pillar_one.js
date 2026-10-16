const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(12);
const p=bot.entity.position.floored(),base=bot.blockAt(p.offset(0,-1,0));if(base?.boundingBox!=='block')throw Error('need floor');
if(bot.blockAt(p.offset(0,2,0))?.boundingBox==='block')throw Error('ceiling');
if(bot.blockAt(p).name==='snow')await bot.dig(bot.blockAt(p));
await bot.equip(bot.inventory.items().find(i=>i.name==='cobblestone'),'hand');
await bot.lookAt(base.position.offset(0.5,1,0.5),true);console.log('start',bot.entity.position);bot.setControlState('jump',true);await bot.waitForTicks(4);
console.log('jump',bot.entity.position);try{await bot.placeBlock(base,new Vec3(0,1,0));}finally{bot.setControlState('jump',false);}
await bot.waitForTicks(12);console.log('placed',bot.blockAt(p).name,'end',bot.entity.position);return {health:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count])};

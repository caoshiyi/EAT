const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();
console.log('START',bot.health,bot.entity.position,Object.values(bot.entities).filter(e=>e!==bot.entity&&e.position&&e.position.distanceTo(bot.entity.position)<12).map(e=>[e.name,e.position]));
if(bot.game.dimension!=='overworld')throw Error('wrong dimension');
const dp=new Vec3(7,67,81);let d=bot.blockAt(dp);if(!d?.name.endsWith('_door'))throw Error('missing eastdoor');
if(!d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(3);}
await bot.lookAt(new Vec3(7.4,bot.entity.position.y+1.62,83.5),true);bot.setControlState('jump',true);bot.setControlState('forward',true);
try{for(let t=0;t<50;t++){await bot.waitForTicks(1);if(bot.entity.position.z>82.25&&bot.entity.position.y>=67)break;}}finally{bot.clearControlStates();}
console.log('AFTER',bot.entity.position,bot.health);
for(const x of[6,7]){const d=bot.blockAt(new Vec3(x,67,81));if(d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(5);}}
const food=bot.inventory.items().find(i=>i.name==='cooked_cod');if(food&&bot.food<20){await bot.equip(food,'hand');await bot.consume();await bot.waitForTicks(4);}
console.log('END',bot.entity.position,bot.health,'doors',[6,7].map(x=>bot.blockAt(new Vec3(x,67,81)).getProperties().open));

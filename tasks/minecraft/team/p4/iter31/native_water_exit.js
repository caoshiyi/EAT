const {Vec3}=require('vec3'),began=Date.now(),snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,water:bot.entity.isInWater,oxygen:bot.oxygenLevel});
try{bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('SOURCE',JSON.stringify(snap()));if(bot.game.dimension!=='overworld'||bot.health<=0)throw Error('life');
bot.setControlState('jump',true);for(let k=0;k<100&&bot.entity.position.y<62.3;k++)await bot.waitForTicks(1);console.log('SURFACE',JSON.stringify(snap()));
await bot.lookAt(new Vec3(48,bot.entity.position.y+bot.entity.eyeHeight,229),true);bot.setControlState('forward',true);
for(let k=0;k<360;k++){await bot.waitForTicks(1);if(k%20===0)console.log('SWIM',JSON.stringify(snap()));if(bot.health<15||bot.entity.position.z<229.8)break;}
}catch(e){console.log('FAIL',String(e));}finally{bot.clearControlStates();bot.pathfinder.setGoal(null);await bot.waitForTicks(4);console.log('END',JSON.stringify(snap()));}
return snap();

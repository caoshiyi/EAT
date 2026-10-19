const {Vec3}=require('vec3'),start=Date.now(),hp=bot.health;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,water:bot.entity.isInWater,oxygen:bot.oxygenLevel});
let dead=false;const death=()=>{dead=true;bot.clearControlStates();};bot.on('death',death);
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('WATER_EXIT_SOURCE',JSON.stringify(snap()));
if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(new Vec3(-.3,56,-24.48062359791109))>.2||bot.health!==20)throw Error('source');
await bot.lookAt(new Vec3(.65,58.5,-24.48),true);bot.setControlState('jump',true);
for(let k=0;k<160;k++){
await bot.waitForTicks(1);const p=bot.entity.position;
if(dead||bot.health<hp||bot.game.dimension!=='overworld')throw Error('life/health');
bot.setControlState('forward',p.y>57.6&&p.x<.45);
if(k%20===0)console.log('WATER_EXIT_TICK',JSON.stringify(snap()));
if(p.x>.4&&p.y>=57.99&&bot.entity.onGround)break;
}
}catch(e){console.log('WATER_EXIT_FAILURE',String(e));}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',death);await bot.waitForTicks(8);console.log('WATER_EXIT_END',JSON.stringify(snap()));}
return snap();

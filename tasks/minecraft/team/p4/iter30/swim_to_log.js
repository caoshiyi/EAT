const {Vec3}=require('vec3'),began=Date.now(),hp=bot.health;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,water:bot.entity.isInWater,ground:bot.entity.onGround,oxygen:bot.oxygenLevel});
let died=false;const death=()=>{died=true;bot.clearControlStates();};bot.on('death',death);
function guard(){if(died||bot.health<hp||bot.game.dimension!=='overworld'||Date.now()-began>40000)throw Error('life/health/time');}
async function swim(x,z){
const from=bot.entity.position.clone(),dx=x-from.x,dz=z-from.z,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
for(let k=0;k<160;k++){guard();const p=bot.entity.position,r=(x-p.x)*ux+(z-p.z)*uz;if(r<.15)break;await bot.lookAt(new Vec3(x,p.y+1.62,z),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(1);}
bot.setControlState('forward',false);await bot.waitForTicks(2);console.log('SWIM_WAYPOINT',JSON.stringify({target:[x,z],state:snap()}));if(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.65)throw Error('waypoint failed');
}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('SWIM_SOURCE',JSON.stringify(snap()));if(bot.health!==20||Math.hypot(bot.entity.position.x+.3,bot.entity.position.z+24.48)>.3)throw Error('source');
await swim(-2.5,-24.48);await swim(-2.5,-25.5);await swim(-5.5,-25.5);
bot.setControlState('jump',true);for(let k=0;k<180&&bot.entity.position.y<62.9;k++){guard();await bot.waitForTicks(1);}
console.log('SWIM_TOP',JSON.stringify(snap()));
}catch(e){console.log('SWIM_FAILURE',String(e));}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',death);await bot.waitForTicks(5);console.log('SWIM_END',JSON.stringify(snap()));}
return snap();

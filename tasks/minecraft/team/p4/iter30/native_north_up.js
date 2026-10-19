const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),src=bot.entity.position.clone(),rows=[];
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,velocity:bot.entity.velocity?.clone(),width:bot.entity.width,height:bot.entity.height,eyeHeight:bot.entity.eyeHeight,water:bot.entity.isInWater,lava:bot.entity.isInLava,dim:bot.game.dimension});
try{
bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(3);console.log('NATIVE_ASCENT_SOURCE',JSON.stringify(snap()));if(bot.health!==20||bot.game.dimension!=='the_nether'||Math.hypot(bot.entity.position.x-4.5,bot.entity.position.z-2.3)>.3)throw Error('actual ascent source');
const cells=[];for(let y=65;y<=69;y++)for(const z of[1,2,3]){const q=v(4,y,z),b=bot.blockAt(q);cells.push({p:q,n:b?.name,shape:b?.shapes});}console.log('ACTUAL_NATIVE_HEADROOM',JSON.stringify(cells));
const dest=v(4,66,1);if(bot.blockAt(dest)?.boundingBox!=='empty'||bot.blockAt(dest.offset(0,1,0))?.boundingBox!=='empty'||bot.blockAt(dest.offset(0,-1,0))?.boundingBox!=='block')throw Error('actual one-up geometry');
// First jump stationary: decouple native jump ability from planner/forward timing.
bot.setControlState('jump',true);let high=false;
for(let k=0;k<12;k++){await bot.waitForTicks(1);rows.push({k,...snap()});if(bot.entity.position.y>=66.04){high=true;break;}}
console.log('ACTUAL_JUMP_HEIGHT',JSON.stringify({high,rows}));
if(high){await bot.lookAt(v(4.5,bot.entity.position.y+bot.entity.eyeHeight,1.5),true);bot.setControlState('forward',true);for(let k=0;k<20&&bot.entity.position.z>1.63;k++)await bot.waitForTicks(1);bot.clearControlStates();await bot.waitForTicks(10);console.log('ACTUAL_NATIVE_UP_END',JSON.stringify(snap()));}
}catch(e){console.log('NATIVE_UP_FAILURE',String(e));}
finally{bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(5);console.log('NATIVE_UP_POST',JSON.stringify(snap()));}
return snap();

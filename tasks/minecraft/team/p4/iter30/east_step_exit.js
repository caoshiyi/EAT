const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),began=Date.now(),src=bot.entity.position.clone(),hp=bot.health;
let dead=false;const death=()=>{dead=true;bot.clearControlStates();};bot.on('death',death);
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,water:bot.entity.isInWater,inventory:bot.inventory.items().map(i=>[i.name,i.count])});
const guard=()=>{if(dead||bot.health!==hp||bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(src)>8||Date.now()-began>48000)throw Error('life/health/displacement/budget');};
async function face(q){for(const o of [[.01,.5,.5],[.5,.01,.5],[.5,.5,.5],[.5,.99,.5]]){await bot.lookAt(q.offset(...o),true);await bot.waitForTicks(1);guard();const b=bot.blockAtCursor(4.5);if(b?.position.equals(q))return b;}throw Error('not current visible '+q);}
async function cut(q){const b=bot.blockAt(q);if(b?.boundingBox==='empty'||b?.name==='air')return;if(!['dirt','grass_block','snow'].includes(b?.name))throw Error('not soil/snow '+b?.name);await bot.unequip('hand');await face(q);await bot.dig(b,true,'raycast');await bot.waitForTicks(2);guard();console.log('STEP_CUT',JSON.stringify({q,now:bot.blockAt(q)?.name,state:snap()}));}
async function move(x,z,minY,ticks=100){await bot.lookAt(v(x,bot.entity.position.y+1.62,z),true);bot.setControlState('jump',true);try{for(let k=0;k<ticks;k++){guard();const p=bot.entity.position;bot.setControlState('forward',Math.hypot(x-p.x,z-p.z)>.13);await bot.waitForTicks(1);if(Math.hypot(x-p.x,z-p.z)<.18&&bot.entity.onGround&&p.y>=minY)break;}}finally{bot.clearControlStates();}await bot.waitForTicks(6);guard();console.log('STEP_MOVE',JSON.stringify({target:[x,z,minY],state:snap()}));if(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.3||bot.entity.position.y<minY)throw Error('move actual failed');}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('STEP_SOURCE',JSON.stringify(snap()));if(bot.health!==20||src.distanceTo(v(-.5833627947,55,-24.480623598))>.1)throw Error('source mismatch');
await cut(v(-1,57,-25));await cut(v(0,57,-25));await cut(v(0,58,-25));await cut(v(0,59,-25));
await move(.5,-24.48,56.99);
const a=bot.entity.position.floored(),floor=a.offset(0,-1,0);if(a.x!==0||a.z!==-25||a.y!==57||!bot.entity.onGround)throw Error('step stack source');
await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');await bot.lookAt(floor.offset(.5,.99,.5),true);bot.setControlState('jump',true);try{for(let k=0;k<15&&bot.entity.position.y<58.04;k++){await bot.waitForTicks(1);guard();}if(bot.entity.position.y<58.04||!bot.blockAtCursor(4.5)?.position.equals(floor))throw Error('step native height/cursor');await bot.placeBlock(bot.blockAt(floor),v(0,1,0));}finally{bot.setControlState('jump',false);}
for(let k=0;k<30&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-58)>.05);k++){await bot.waitForTicks(1);guard();}
console.log('STEP_UP',JSON.stringify(snap()));if(!bot.entity.onGround||Math.abs(bot.entity.position.y-58)>.05)throw Error('step up actual');
await move(.5,-25.5,58.99,90);await bot.waitForTicks(40);guard();console.log('STEP_SURFACE_QUALIFIED',JSON.stringify(snap()));
}catch(e){console.log('STEP_FAILURE',String(e));}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',death);console.log('STEP_END',JSON.stringify(snap()));}
return snap();

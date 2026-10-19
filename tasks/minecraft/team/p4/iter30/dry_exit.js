const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),began=Date.now(),hp=bot.health;
let dead=false;const death=()=>{dead=true;bot.clearControlStates();bot.pathfinder.setGoal(null);};bot.on('death',death);
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,water:bot.entity.isInWater,inventory:bot.inventory.items().map(i=>[i.name,i.count])});
const dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];
function guard(){if(dead||bot.health<hp||bot.game.dimension!=='overworld'||Date.now()-began>55000)throw Error('life/health/budget');}
async function face(q,f=null){for(const a of [[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99]]){guard();await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||f===c.face))return c;}throw Error('no actual visible face '+q);}
async function cut(q){const b=bot.blockAt(q);if(!['dirt','grass_block'].includes(b?.name))throw Error('not soil '+q+':'+b?.name);const c=await face(q);await bot.unequip('hand');await bot.dig(b,'ignore',dirs[c.face]);await bot.waitForTicks(8);guard();console.log('DRY_CUT',JSON.stringify({q,state:snap()}));}
async function put(q){for(const f of [1,2,3,4,5,0]){const ref=q.minus(dirs[f]),b=bot.blockAt(ref);if(b?.boundingBox!=='block')continue;try{await face(ref,f);}catch{continue;}const i=bot.inventory.items().find(i=>i.name==='dirt');if(!i)throw Error('no dirt');await bot.equip(i,'hand');await bot.placeBlock(b,dirs[f]);await bot.waitForTicks(3);if(bot.blockAt(q)?.name!=='dirt')throw Error('put actual post');console.log('DRY_PUT',JSON.stringify({q,state:snap()}));return;}throw Error('no visible anchor '+q);}
async function stack(){guard();const a=bot.entity.position.floored(),ref=a.offset(0,-1,0);if(!bot.entity.onGround)throw Error('not grounded');await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');await bot.lookAt(ref.offset(.5,.99,.5),true);await bot.waitForTicks(1);if(!bot.blockAtCursor(4.5)?.position.equals(ref))throw Error('floor not visible');bot.setControlState('jump',true);try{for(let k=0;k<12&&bot.entity.position.y<a.y+1.04;k++){await bot.waitForTicks(1);guard();}if(bot.entity.position.y<a.y+1.04)throw Error('no native height');const c=bot.blockAtCursor(4.5);if(!c?.position.equals(ref)||c.face!==1)throw Error('airborne actual floor');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}for(let k=0;k<30&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03);k++){await bot.waitForTicks(1);guard();}if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03)throw Error('stack actual ending');console.log('DRY_UP',JSON.stringify(snap()));}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('DRY_SOURCE',JSON.stringify(snap()));if(bot.health!==20||bot.entity.position.distanceTo(v(-.5833627947,55,-24.480623598))>.1)throw Error('actual source');
await cut(v(0,56,-25));await cut(v(0,55,-25));await cut(v(-1,57,-25));await put(v(-2,57,-25));await bot.waitForTicks(30);console.log('DRY_PLUGGED',JSON.stringify(snap()));
if(bot.entity.isInWater)throw Error('water not excluded');
while(bot.entity.position.y<57.99)await stack();
await bot.lookAt(v(.55,59,-24.48),true);bot.setControlState('jump',true);
for(let k=0;k<45;k++){guard();bot.setControlState('forward',bot.entity.position.x<.45);await bot.waitForTicks(1);if(bot.entity.position.x>.4&&bot.entity.position.y>=58.99&&bot.entity.onGround)break;}
bot.clearControlStates();await bot.waitForTicks(8);if(bot.entity.position.x<.3||bot.entity.position.y<58.9)throw Error('east surface not reached');
console.log('DRY_SURFACE',JSON.stringify(snap()));await bot.waitForTicks(60);guard();
}catch(e){console.log('DRY_FAILURE',String(e));}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',death);console.log('DRY_END',JSON.stringify(snap()));}
return snap();

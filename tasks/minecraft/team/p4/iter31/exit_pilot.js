const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),start=bot.entity.position.clone();
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),sky:{timeOfDay:bot.time.timeOfDay,isDay:bot.time.isDay}});
async function face(q,f=null){for(const off of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.99,.5,.5],[.01,.5,.5]]){await bot.lookAt(q.offset(...off),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return;}throw Error('not visible '+q);}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('SOURCE',JSON.stringify(snap()));if(bot.game.dimension!=='overworld'||bot.health<18||start.distanceTo(v(6.5,66,-36.5))>.2)throw Error('source');
for(let level=0;level<2;level++){
const q=bot.entity.position.floored(),roof=q.offset(0,2,0),b=bot.blockAt(roof);if(b&&b.boundingBox!=='empty'){if(!['dirt','grass_block','snow'].includes(b.name))throw Error('roof '+b.name);await face(roof);await bot.dig(b,true,'raycast');await bot.waitForTicks(3);}
if(bot.health<18)throw Error('damage');const ref=q.offset(0,-1,0);await face(ref,1);const i=bot.inventory.items().find(i=>i.name==='dirt');if(!i)throw Error('no dirt');await bot.equip(i,'hand');await bot.lookAt(ref.offset(.5,1,.5),true);
bot.setControlState('jump',true);try{for(let k=0;k<12&&bot.entity.position.y<q.y+.85;k++)await bot.waitForTicks(1);if(bot.entity.position.y<q.y+.85)throw Error('jump blocked');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}await bot.waitForTicks(10);console.log('UP',JSON.stringify(snap()));if(!bot.entity.onGround||bot.entity.position.y<q.y+.95)throw Error('not landed');
}
}catch(e){console.log('FAIL',String(e));}finally{bot.clearControlStates();bot.pathfinder.setGoal(null);await bot.waitForTicks(6);console.log('END',JSON.stringify(snap()));}
return snap();

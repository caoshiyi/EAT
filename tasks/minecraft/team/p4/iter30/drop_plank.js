const {Vec3}=require('vec3'),p=bot.entity.position.clone(),q=p.floored();
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count])});
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('DROP_SOURCE',JSON.stringify(snap()));
if(bot.health!==20||p.distanceTo(new Vec3(9.5,78,-36.5))>.1)throw Error('actual source');
const landing=new Vec3(9,69,-37);if(!bot.blockAt(landing)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'))throw Error('landing not actual full69');
for(let y=70;y<=76;y++){if(bot.blockAt(new Vec3(9,y,-37))?.boundingBox!=='empty')throw Error('dropcolumn obstruction '+y);}
// Look around the one-layer snow from outside its horizontal footprint.
bot.setControlState('sneak',true);await bot.waitForTicks(3);
await bot.lookAt(new Vec3(11,p.y+1.27,p.z),true);
for(let k=0;k<30&&bot.entity.position.x<10.13;k++){bot.setControlState('forward',true);await bot.waitForTicks(1);if(bot.health!==20||bot.entity.position.y<77.95)throw Error('lean health/height');}
bot.setControlState('forward',false);await bot.waitForTicks(3);console.log('DROP_LEAN',JSON.stringify(snap()));
if(bot.entity.position.x<10.02||bot.entity.position.x>10.30)throw Error('not actual safe outside snow footprint');
const support=new Vec3(9,77,-37),b=bot.blockAt(support);if(b?.name!=='spruce_planks')throw Error('not actualplank support');await bot.lookAt(new Vec3(9.999,77.5,-36.5),true);await bot.waitForTicks(1);if(!bot.blockAtCursor(4.5)?.position.equals(support))throw Error('support not currentvisible');await bot.dig(b,true,'raycast');
for(let k=0;k<40;k++){await bot.waitForTicks(1);if(k%5===0)console.log('DROP_TICK',JSON.stringify(snap()));if(bot.entity.onGround&&bot.entity.position.y<77)break;}
await bot.waitForTicks(25);console.log('DROP_LANDING',JSON.stringify(snap()));
}catch(e){console.log('DROP_FAILURE',String(e));}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('DROP_END',JSON.stringify(snap()));}
return snap();

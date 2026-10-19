const {Vec3}=require('vec3'),hp=bot.health,p0=bot.entity.position.clone();let dead=false,timer;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inventory:bot.inventory.items().map(i=>[i.name,i.count]),ground:bot.entity.onGround});
const fail=()=>{if(dead||bot.health<hp||bot.entity.position.distanceTo(p0)>20)throw Error('life/health/displacement');};
const death=()=>{dead=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',death);
let win;
try{
console.log('CHEST_SOURCE',JSON.stringify(snap()));if(bot.game.dimension!=='overworld'||bot.health!==20||bot.entity.position.distanceTo(new Vec3(4.5,65,-31.5))>.5)throw Error('actual respawn source mismatch');
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];bot.pathfinder.setMovements(m);
await Promise.race([bot.pathfinder.goto(new goals.GoalNear(10,67,-35,2)),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('30s navigation budget'));},30000))]);fail();bot.pathfinder.setGoal(null);bot.clearControlStates();
const q=new Vec3(10,66,-35),b=bot.blockAt(q);if(b?.name!=='chest')throw Error('actual chest missing');
await bot.lookAt(q.offset(.5,.5,.5),true);await bot.waitForTicks(2);fail();const cur=bot.blockAtCursor(4.5);console.log('CHEST_CURSOR',JSON.stringify({state:snap(),block:cur?.name,p:cur?.position}));
if(!cur?.position.equals(q))throw Error('chest not current visible reach');
win=await bot.openContainer(b);console.log('ACTUAL_CHEST_CONTENTS',JSON.stringify(win.containerItems().map(i=>({name:i.name,count:i.count,used:i.durabilityUsed}))));
}catch(e){console.log('CHEST_FAILURE',String(e));}
finally{clearTimeout(timer);if(win)win.close();bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',death);console.log('CHEST_END',JSON.stringify(snap()));}
return snap();

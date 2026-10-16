const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();
for(let z=89;z<=92;z++){
 const p=new Vec3(9,67,z),b=bot.blockAt(p);if(b.name==='air'){await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');await bot.placeBlock(bot.blockAt(p.offset(0,-1,0)),new Vec3(0,1,0));}console.log('wall',p,bot.blockAt(p).name);
}
const w=new Vec3(7,67,92),q=new Vec3(7,67,91);
for(const [name,p]of[['water_bucket',w],['lava_bucket',q]]){
await bot.equip(bot.inventory.items().find(i=>i.name===name),'hand');await bot.lookAt(p.offset(.5,.01,.5),true);await bot.waitForTicks(4);console.log('aim',name,bot.blockAtCursor(5)?.name,bot.blockAtCursor(5)?.position);bot.activateItem();await bot.waitForTicks(15);console.log('used',name,'target',bot.blockAt(p).name,'inv',bot.inventory.items().filter(i=>/bucket/.test(i.name)).map(i=>[i.name,i.count]));
}
console.log('CAST RESULT',bot.blockAt(q).name,bot.blockAt(w).name,bot.blockAt(w).getProperties());return{p:bot.entity.position,health:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count])};

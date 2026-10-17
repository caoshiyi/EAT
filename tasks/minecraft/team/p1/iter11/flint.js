const{Vec3}=require('vec3');bot.clearControlStates();bot.pathfinder.setGoal(null);
const q=new Vec3(7,48,88),ref=q.offset(0,-1,0),start=Date.now();let issue=null,n=0;
try{if(bot.entity.position.distanceTo(new Vec3(6.5,47,88.5))>.5||bot.health<19)throw Error('BODY');if(bot.blockAt(ref)?.name!=='cobblestone')throw Error('FLOOR');
if(bot.blockAt(q)?.name==='cobblestone'){await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');await bot.dig(bot.blockAt(q),true);}
while(n<40&&Date.now()-start<48000&&!bot.inventory.items().some(i=>i.name==='flint')){
let b=bot.blockAt(q);if(b.name==='air'){let g=bot.inventory.items().find(i=>i.name==='gravel');if(!g)throw Error('NO_GRAVEL');await bot.equip(g,'hand');await bot.placeBlock(bot.blockAt(ref),new Vec3(0,1,0));b=bot.blockAt(q);}
if(b.name!=='gravel')throw Error('KIND_'+b.name);await bot.unequip('hand');await bot.dig(b,true);await bot.waitForTicks(24);n++;
}
}catch(e){issue=e.message}finally{bot.clearControlStates();if(bot.blockAt(q)?.name==='air'){await bot.equip(bot.inventory.items().find(i=>i.name==='cobblestone'),'hand');await bot.placeBlock(bot.blockAt(ref),new Vec3(0,1,0));}console.log('FLINT',JSON.stringify({n,issue,hp:bot.health,p:bot.entity.position,wall:bot.blockAt(q)?.name,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])}));}

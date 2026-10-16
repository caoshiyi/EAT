const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(10);const p=bot.entity.position.floored();console.log('start',p.toString(),'health',bot.health,'mobs',Object.values(bot.entities).filter(e=>['skeleton','zombie','creeper'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<20).map(e=>({name:e.name,p:e.position.toString()})));
await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');
const dirs=[new Vec3(1,0,0),new Vec3(-1,0,0),new Vec3(0,0,1),new Vec3(0,0,-1),new Vec3(0,-1,0),new Vec3(0,1,0)];
for(const y of [0,1,2])for(const d of dirs.slice(0,4)){
 const target=p.plus(d).offset(0,y,0);if(y===2&&d.x!==1)continue;if(bot.blockAt(target)?.boundingBox==='block')continue;
 for(const v of dirs){const b=bot.blockAt(target.minus(v));if(b?.boundingBox==='block'){try{await bot.placeBlock(b,v);break;}catch(e){console.log('place',e.message);}}}
}
const roof=p.offset(0,2,0);if(bot.blockAt(roof).boundingBox!=='block')for(const v of dirs){const b=bot.blockAt(roof.minus(v));if(b?.boundingBox==='block'){try{await bot.placeBlock(b,v);break;}catch(e){}}}
console.log('end',bot.health,bot.entity.position.toString());

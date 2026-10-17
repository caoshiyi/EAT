const{Vec3}=require('vec3'),q=new Vec3(145,-34,2241),start=Date.now(),body=bot.entity,hp=bot.health;let issue=null,trace=[];
const full=b=>b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),count=()=>bot.inventory.items().filter(i=>i.name==='cobblestone_slab').reduce((n,i)=>n+i.count,0),before=count();bot.clearControlStates();bot.pathfinder.setGoal(null);
try{
 if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(new Vec3(144.5,-32,2241.5))>.2)throw Error('ACTUAL_BODY');
 if(!full(bot.blockAt(q))){
  if(bot.blockAt(q)?.name!=='air'||before!==2||!full(bot.blockAt(q.offset(0,-1,0))))throw Error('EXACT_AIR_STOCK_REFERENCE');
  await bot.equip(bot.inventory.items().find(i=>i.name==='cobblestone_slab'),'hand');bot.setControlState('sneak',true);
  await bot.placeBlock(bot.blockAt(q.offset(0,-1,0)),new Vec3(0,1,0));await bot.waitForTicks(2);
  const first=bot.blockAt(q);trace.push(['FIRST',first?.name,first?.getProperties(),count()]);if(first?.name!=='cobblestone_slab'||first.getProperties().type!=='bottom'||count()!==1)throw Error('FIRST_ACK');
  // A normal click on the existing slab's actual upper face merges the cell.
  // placeBlock wrapper assumes adjacent destination/type-change, so observe this same-cell state change directly.
  await bot._genericPlace(first,new Vec3(0,1,0),{forceLook:true,delta:new Vec3(.5,.5,.5),swingArm:'right'});
  for(let n=0;n<30&&!full(bot.blockAt(q));n++)await bot.waitForTicks(1);
  if(!full(bot.blockAt(q))||count()!==0)throw Error('DOUBLE_ACK');
 }
 if(bot.entity!==body||bot.health<hp||Date.now()-start>10000)throw Error('BODY_TIME');
}catch(e){issue=e.message}finally{bot.clearControlStates();bot.pathfinder.setGoal(null)}
const b=bot.blockAt(q);return{issue,q:q.toArray(),name:b?.name,properties:b?.getProperties(),full:full(b),before,after:count(),p:bot.entity.position,hp:bot.health,trace,controls:bot.controlState};

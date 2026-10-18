const V=require('vec3').Vec3,m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
try{await bot.pathfinder.goto(new goals.GoalBlock(140,-36,2231));}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
const ref=bot.blockAt(new V(140,-37,2232)),dest=bot.blockAt(new V(140,-36,2232));if(dest.boundingBox!=='empty')return {refused:'target occupied'};
await bot.lookAt(new V(140.35,-36.001,2232.35),true);await bot.waitForTicks(2);const hit=bot.blockAtCursor(4.5);console.log('PLACE_PRE',JSON.stringify({p:bot.entity.position,ref:ref.position,hit:hit&&{p:hit.position,face:hit.face,intersect:hit.intersect}}));
if(!hit||!hit.position.equals(ref.position)||hit.face!==1)return {refused:'floor top not direct'};
await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');await bot.placeBlock(ref,new V(0,1,0));await bot.waitForTicks(3);return {actual:bot.blockAt(dest.position).name,hp:bot.health,pos:bot.entity.position,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count}))};

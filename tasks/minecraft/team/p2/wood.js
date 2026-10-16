const m=new Movements(bot);m.canDig=false;bot.pathfinder.setMovements(m);
for(let i=0;i<4;i++){
const b=bot.findBlock({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:20});if(!b)break;
const timer=setTimeout(()=>bot.pathfinder.setGoal(null),7000);
try{await bot.pathfinder.goto(new goals.GoalNear(b.position.x,b.position.y,b.position.z,2));}catch(e){console.log(e.message);}finally{clearTimeout(timer);}
if(bot.entity.position.distanceTo(b.position)>5)break;
await bot.dig(b);await bot.waitForTicks(10);
}
console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));

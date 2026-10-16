const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
const drop=Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<12).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];
if(drop){console.log('target',drop.position);try{await bot.pathfinder.goto(new goals.GoalNear(drop.position.x,drop.position.y,drop.position.z,1));}catch(e){console.log('path error',e.message);}await bot.waitForTicks(15);}
return {pos:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

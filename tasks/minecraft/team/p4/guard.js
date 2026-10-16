bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const axe=bot.inventory.items().find(i=>i.name==='stone_axe');await bot.equip(axe,'hand');
console.log('near',Object.values(bot.entities).filter(e=>['skeleton','zombie','zombie_villager','husk','drowned','stray','spider','cave_spider','creeper','witch'].includes(e.name)&&Math.abs(e.position.y-bot.entity.position.y)<8&&e.position.distanceTo(bot.entity.position)<24).map(e=>({id:e.id,name:e.name,p:e.position.toString()})));
const m=new Movements(bot);m.canDig=false;m.maxDropDown=1;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1000;
const end=Date.now()+35000;while(Date.now()<end){
 const t=Object.values(bot.entities).filter(e=>['skeleton','zombie','zombie_villager','husk','drowned','stray','spider','cave_spider','witch'].includes(e.name)&&Math.abs(e.position.y-bot.entity.position.y)<5&&e.position.distanceTo(bot.entity.position)<18).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];
 if(t){console.log('target',t.name,t.id);if(t.position.distanceTo(bot.entity.position)>3){const timer=setTimeout(()=>bot.pathfinder.setGoal(null),2000);try{await bot.pathfinder.goto(new goals.GoalNear(t.position.x,t.position.y,t.position.z,1.5));}catch(e){}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);}}
 if(t.position.distanceTo(bot.entity.position)<3.5){await bot.lookAt(t.position.offset(0,1,0),true);await bot.equip(axe,'hand');bot.attack(t);} }
 await bot.waitForTicks(26);if(bot.health<7)break;
}
bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('health',bot.health,'food',bot.food,'pos',bot.entity.position.toString());

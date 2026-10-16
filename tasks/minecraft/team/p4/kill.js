bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
const end=Date.now()+27000;
for(let n=0;n<5&&Date.now()<end;n++){
const target=Object.values(bot.entities).filter(e=>['chicken','sheep'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<35).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];if(!target)break;
console.log('hunt',target.name,target.id);
await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_pickaxe'),'hand');
for(let i=0;i<10&&bot.entities[target.id]&&Date.now()<end;i++){
try{await bot.pathfinder.goto(new goals.GoalNear(target.position.x,target.position.y,target.position.z,1.5));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}
if(target.position.distanceTo(bot.entity.position)<3.4){await bot.lookAt(target.position.offset(0,0.5,0));bot.attack(target);await bot.waitForTicks(16);}
}
const drops=Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<7);
for(const d of drops){try{await bot.pathfinder.goto(new goals.GoalNear(d.position.x,d.position.y,d.position.z,0.5));}catch(e){bot.pathfinder.stop();}}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));
}
bot.pathfinder.stop();

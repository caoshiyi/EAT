bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.allow1by1towers=true;m.maxDropDown=1;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2000;
const p=bot.entity.position.floored();console.log('start',p.toString());
for(let i=0;i<3;i++){
 const p=bot.entity.position.floored();try{await bot.pathfinder.goto(new goals.GoalNear(p.x+4,p.y+4,p.z,1));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}
 console.log('position',bot.entity.position.toString());
}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

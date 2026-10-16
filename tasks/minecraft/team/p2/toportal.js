bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);
const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;m.allow1by1towers=false;m.exclusionAreasStep.push(b=>b.position.y<62?100:0);for(const n of ['crafting_table','furnace','chest'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
for(let i=0;i<10;i++){
const p=bot.entity.position.clone();if(p.z>=86&&Math.abs(p.x-8)<4)break;
const tx=p.x>9?Math.floor(p.x)-1:8,tz=Math.min(88,Math.floor(p.z)+8);const t=setTimeout(()=>bot.pathfinder.setGoal(null),3000);
try{await bot.pathfinder.goto(new goals.GoalXZ(tx,tz));}catch(e){console.log('nav',e.message);}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates();}await bot.waitForTicks(4);console.log(i,bot.entity.position,'hp',bot.health);
if(bot.entity.position.distanceTo(p)<1||bot.health<10)break;
}
console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));

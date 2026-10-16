bot.pathfinder.setGoal(null);bot.clearControlStates();
const p=bot.entity.position.floored();
for(let y=-1;y<=2;y++){let row=[];for(let z=0;z<=4;z++){const b=bot.blockAt(p.offset(0,y,z));row.push(b?.name);}console.log('forward slice',y,row);}
const m=new Movements(bot);m.canDig=true;m.allow1by1towers=true;bot.pathfinder.setMovements(m);
const timer=setTimeout(()=>bot.pathfinder.setGoal(null),20000);
try{await bot.pathfinder.goto(new goals.GoalNear(14,68,85,8));}catch(e){console.log('nav',e.message);}finally{clearTimeout(timer);bot.clearControlStates();}
console.log('pos',bot.entity.position,'health',bot.health);

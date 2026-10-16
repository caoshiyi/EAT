const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
const t=setTimeout(()=>bot.pathfinder.setGoal(null),10000);
try{await bot.pathfinder.goto(new goals.GoalNear(8,67,90,1));}catch(e){console.log(e.message);}finally{clearTimeout(t);bot.clearControlStates();}
console.log('pos',bot.entity.position);
for(let y=65;y<=70;y++){let row=[];for(let x=7;x<=12;x++){row.push(bot.blockAt(new (require('vec3').Vec3)(x,y,90))?.name);}console.log('slice y',y,row);}

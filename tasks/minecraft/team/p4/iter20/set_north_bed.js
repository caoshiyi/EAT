const V=require('vec3').Vec3,m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
try{await bot.pathfinder.goto(new goals.GoalBlock(142,-36,2231));}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
const p=new V(142,-36,2232),b=bot.blockAt(p);if(b.name!=='white_bed')return {refused:'bed absent'};
await bot.lookAt(new V(142.3,-35.4376,2232.1),true);await bot.waitForTicks(2);const hit=bot.blockAtCursor(4.5);if(!hit||!hit.position.equals(p))return {refused:'bed not direct',hit:hit&&hit.position};
const messages=[];const msg=m=>messages.push(String(m));bot.on('message',msg);
try{await bot.activateBlock(b,new V(0,1,0),new V(.3,.5624,.1));await bot.waitForTicks(10);}finally{bot.removeListener('message',msg);}
return {p:bot.entity.position,hp:bot.health,food:bot.food,bed:b.name,cursor:{p:hit.position,face:hit.face,intersect:hit.intersect},messages,sleeping:bot.isSleeping};

const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);console.log('water',bot.findBlocks({matching:bot.registry.blocksByName.water.id,maxDistance:15,count:12}).map(p=>({p:p.toString(),above:bot.blockAt(p.offset(0,1,0)).name})));
const m=new Movements(bot);m.canDig=false;m.maxDropDown=1;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2000;
const timer=setTimeout(()=>bot.pathfinder.setGoal(null),9000);try{await bot.pathfinder.goto(new goals.GoalNear(-5,62,-26,1));}catch(e){console.log('path',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);}
console.log('position',bot.entity.position.toString(),'head',bot.blockAt(bot.entity.position.offset(0,1,0)).name,'oxygen',bot.oxygenLevel);
if(bot.blockAt(bot.entity.position.offset(0,1,0)).name==='water'){bot.setControlState('jump',true);await bot.waitForTicks(80);bot.clearControlStates();}
console.log('final',bot.entity.position.toString(),'head',bot.blockAt(bot.entity.position.offset(0,1,0)).name,'health',bot.health);

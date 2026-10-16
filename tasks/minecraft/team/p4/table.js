bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;m.allowParkour=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
for(let i=0;i<3;i++){const p=bot.entity.position;try{await bot.pathfinder.goto(new goals.GoalNear(Math.min(11,p.x+4),Math.min(69,p.y+3),Math.min(-35,p.z+4),1));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}console.log('position',bot.entity.position.toString());}
bot.pathfinder.stop();console.log('logs',bot.findBlocks({matching:bot.registry.blocksByName.spruce_log.id,maxDistance:8,count:15}).map(p=>p.toString()));

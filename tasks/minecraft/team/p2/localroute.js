const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
for(let i=0;i<8;i++){
const p=bot.entity.position.clone();let timer=setTimeout(()=>bot.pathfinder.setGoal(null),4000);
try{await bot.pathfinder.goto(new goals.GoalXZ(Math.floor(p.x),Math.floor(p.z)+8));}catch(e){console.log('nav',e.message);}finally{clearTimeout(timer);}
console.log('leg',i,bot.entity.position);
if(bot.entity.position.distanceTo(p)<2){console.log('stuck');break;}
if(bot.health<12)break;
}
bot.pathfinder.setGoal(null);bot.clearControlStates();
console.log('lava',bot.findBlocks({matching:bot.registry.blocksByName.lava.id,maxDistance:96,count:30}));

const m=new Movements(bot); m.canDig=false;m.allow1by1towers=false;bot.pathfinder.setMovements(m);
const goal=new goals.GoalNear(0,70,100,8);
const deadline=setTimeout(()=>bot.pathfinder.setGoal(null),23000);
try{await bot.pathfinder.goto(goal);}catch(e){console.log('nav',e.message);}finally{clearTimeout(deadline);bot.clearControlStates();}
console.log('pos',bot.entity.position);
for(const name of ['lava','hay_block','chest','bell','wheat','spruce_log']){const id=bot.registry.blocksByName[name]?.id;if(id)console.log(name,bot.findBlocks({matching:id,maxDistance:80,count:5}));}
console.log('animals',Object.values(bot.entities).filter(e=>['cow','sheep','pig','villager'].includes(e.name)).map(e=>({name:e.name,pos:e.position})).slice(0,15));

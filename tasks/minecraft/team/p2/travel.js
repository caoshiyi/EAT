const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;bot.pathfinder.setMovements(m);
const end=Date.now()+45000;
for(let leg=0;leg<3&&Date.now()<end;leg++){
const p=bot.entity.position;const timer=setTimeout(()=>bot.pathfinder.setGoal(null),12000);
try{await bot.pathfinder.goto(new goals.GoalXZ(Math.floor(p.x),Math.floor(p.z)+45));}catch(e){console.log('nav',e.message);}finally{clearTimeout(timer);bot.clearControlStates();}
console.log('position',bot.entity.position,'health',bot.health,'food',bot.food);
for(const name of ['lava','hay_block','chest','bell','wheat','obsidian']){const id=bot.registry.blocksByName[name]?.id;if(id){const ps=bot.findBlocks({matching:id,maxDistance:96,count:6});if(ps.length)console.log(name,ps);}}
console.log('villagers',Object.values(bot.entities).filter(e=>e.name==='villager').map(e=>e.position));
if(bot.health<12)break;
}

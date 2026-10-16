bot.pathfinder.setGoal(null);bot.clearControlStates();const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;m.exclusionAreasStep.push(b=>b.position.y<60?100:0);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1600;
for(let i=0;i<7;i++){
const p=bot.entity.position.clone();await bot.lookAt(p.offset(30,0,10),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(60);bot.clearControlStates();console.log(i,bot.entity.position,'health',bot.health,'food',bot.food);
if(bot.health<14||bot.food<9)break;
if(bot.entity.position.distanceTo(p)<2){const t=setTimeout(()=>bot.pathfinder.setGoal(null),4000);try{await bot.pathfinder.goto(new goals.GoalNear(Math.floor(p.x)+8,Math.max(63,Math.floor(p.y)),Math.floor(p.z)+4,2));}catch(e){console.log(e.message);}finally{clearTimeout(t);bot.clearControlStates();}if(bot.entity.position.distanceTo(p)<2)break;}
}
for(const name of ['hay_block','bell','chest','wheat','oak_log','spruce_log']){const id=bot.registry.blocksByName[name]?.id;if(id){const ps=bot.findBlocks({matching:id,maxDistance:96,count:5});if(ps.length)console.log(name,ps);}}
console.log('villagers',Object.values(bot.entities).filter(e=>e.name==='villager').map(e=>e.position));console.log('animals',Object.values(bot.entities).filter(e=>['pig','cow','sheep','chicken'].includes(e.name)).map(e=>({name:e.name,p:e.position})).slice(0,12));

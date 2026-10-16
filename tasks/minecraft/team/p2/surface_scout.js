bot.pathfinder.setGoal(null);bot.clearControlStates();const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;m.exclusionAreasStep.push(b=>b.position.y<60?100:0);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
for(let i=0;i<7;i++){
const p=bot.entity.position.clone();await bot.lookAt(p.offset(0,0,30),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(60);bot.clearControlStates();console.log(i,bot.entity.position,'health',bot.health,'food',bot.food);
if(bot.health<14||bot.food<9)break;
if(bot.entity.position.z-p.z<2){console.log('obstacle detour');const t=setTimeout(()=>bot.pathfinder.setGoal(null),3000);try{await bot.pathfinder.goto(new goals.GoalXZ(Math.floor(p.x)-7,Math.floor(p.z)+5));}catch(e){console.log(e.message);}finally{clearTimeout(t);bot.clearControlStates();}if(bot.entity.position.distanceTo(p)<2)break;}
}
for(const name of ['hay_block','bell','chest','wheat','oak_log','spruce_log']){const id=bot.registry.blocksByName[name]?.id;if(id){const ps=bot.findBlocks({matching:id,maxDistance:96,count:5});if(ps.length)console.log(name,ps);}}
console.log('villagers',Object.values(bot.entities).filter(e=>e.name==='villager').map(e=>e.position));

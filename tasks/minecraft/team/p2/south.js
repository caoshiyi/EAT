const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
for(let i=0;i<10;i++){
const p=bot.entity.position.clone();const t=setTimeout(()=>bot.pathfinder.setGoal(null),3000);
try{await bot.pathfinder.goto(new goals.GoalXZ(Math.floor(p.x)-2,Math.floor(p.z)+10));}catch(e){console.log('nav',e.message);}finally{clearTimeout(t);}
if(bot.entity.position.distanceTo(p)<2)break;
if(i%3===0)console.log('p',bot.entity.position);
}
bot.pathfinder.setGoal(null);bot.clearControlStates();
console.log('pos',bot.entity.position,'health',bot.health,'food',bot.food);
for(const name of ['hay_block','bell','chest','wheat','lava','spruce_log']){const id=bot.registry.blocksByName[name]?.id;if(id){const ps=bot.findBlocks({matching:id,maxDistance:96,count:8});if(ps.length)console.log(name,ps);}}
console.log('villagers',Object.values(bot.entities).filter(e=>e.name==='villager').map(e=>e.position));

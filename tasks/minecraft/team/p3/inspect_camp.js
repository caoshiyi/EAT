const {Vec3}=require('vec3');
bot.pathfinder.setGoal(null);bot.clearControlStates();
if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(new Vec3(7.4,67.56,83.55))>1.2)throw Error('unexpected start');
console.log('BODY',bot.health,bot.food,bot.time.timeOfDay,bot.entity.position);
for(const p of[[6,67,81],[7,67,81],[8,67,83],[8,68,83],[8,69,83]]){const b=bot.blockAt(new Vec3(...p));console.log('ENCLOSURE',p,b?.name,b?.getProperties());}
for(const p of[[7,67,82],[7,68,82]]){const b=bot.blockAt(new Vec3(...p));if(b?.name!=='chest')throw Error('no chest');const c=await bot.openChest(b);try{console.log('CHEST',p,c.containerItems().map(i=>[i.name,i.count,i.durabilityUsed]));}finally{c.close();await bot.waitForTicks(4);}}
console.log('NEAR',Object.values(bot.entities).filter(e=>e.position&&e!==bot.entity&&e.position.distanceTo(bot.entity.position)<20).map(e=>[e.name,e.kind,e.position]));

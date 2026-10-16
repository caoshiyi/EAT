const{Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);
console.log('STATE',bot.entity.position.toString(),bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));
for(const q of [[8,67,83],[8,68,83],[8,69,83],[6,67,81]]){const b=bot.blockAt(new Vec3(...q));console.log('BLOCK',q,b.name,b.getProperties());}
console.log('HOSTILES',Object.values(bot.entities).filter(e=>['zombie','creeper','skeleton','zombie_villager'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<12).map(e=>[e.id,e.name,e.metadata?.[9],e.position.toString()]));
const c=await bot.openContainer(bot.blockAt(new Vec3(7,67,82)));console.log('DEPOT',c.containerItems().map(i=>[i.name,i.count]));c.close();
bot.chat('P4 resumed healthy inside, woodaxe+woodpick+3planks+2sticks. Reconciling hatch/depot. Propose P4 direct STONE bootstrap then return/deposit cobble for P3 kit; P3 owns iron/casting. Please announce any current duplicate stone trip.');

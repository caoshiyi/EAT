const{Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();
console.log('STATE',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]));
for(const [name,coords]of[['portal',[6,68,90]],['oldtable',[33,69,103]],['oldroom',[33,67,103]]]){const q=new Vec3(...coords);console.log(name,bot.blockAt(q)?.name)}
console.log('ORE',bot.findBlocks({matching:bot.registry.blocksByName.iron_ore.id,maxDistance:32,count:20}).map(q=>q.toString()));
console.log('PORTAL_CELLS');for(const x of[5,6,7,8])for(const z of[88,89,90,91])console.log(x,z,...[59,60,61,62,63,64,65,66,67,68,69,70].map(y=>bot.blockAt(new Vec3(x,y,z))?.name));console.log('TIME',bot.time);

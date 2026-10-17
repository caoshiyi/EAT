bot.clearControlStates();bot.pathfinder.setGoal(null);const{Vec3}=require('vec3'),rows=[];
for(let z=274;z<=279;z++)for(let y=7;y<=11;y++)rows.push([y,z,...[17,18,19,20].map(x=>bot.blockAt(new Vec3(x,y,z))?.name)]);
return {p:bot.entity.position,dim:bot.game.dimension,hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),rows,near:Object.values(bot.entities).filter(e=>e.position.distanceTo(bot.entity.position)<12).map(e=>[e.name,e.username,e.position])};

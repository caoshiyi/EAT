bot.pathfinder.setGoal(null);bot.clearControlStates();
const p=bot.entity.position.floored(), cells=[];
for(let x=-2;x<=2;x++)for(let y=-2;y<=3;y++)for(let z=-2;z<=2;z++){const q=p.offset(x,y,z),b=bot.blockAt(q);cells.push([q.toArray(),b?.name,b?.shapes]);}
return {p:bot.entity.position,dim:bot.game.dimension,hp:bot.health,food:bot.food,onGround:bot.entity.onGround,fire:bot.entity.metadata?.[0],inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),cursor:bot.inventory.selectedItem,controls:bot.controlState,goal:bot.pathfinder.goal,cells};

bot.clearControlStates();bot.pathfinder.setGoal(null);const V=bot.entity.position.constructor;
for(let y=60;y<=71;y++){const row=[];for(const [x,z]of[[10,88],[9,88],[11,88],[10,87],[10,89]]){const b=bot.blockAt(new V(x,y,z));row.push([x,y,z,b?.name]);}console.log('ROW',JSON.stringify(row));}
console.log('BODY',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count])}));

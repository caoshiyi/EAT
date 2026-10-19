bot.clearControlStates();bot.pathfinder.setGoal(null);
const p=bot.entity.position.floored(); console.log('STATE',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState}));
for(let y=p.y-1;y<=p.y+16;y++){let row=[];for(let x=p.x-1;x<=p.x+1;x++)for(let z=p.z-1;z<=p.z+1;z++){let b=bot.blockAt(p.offset(x-p.x,y-p.y,z-p.z));row.push([x,y,z,b?.name]);} console.log('ROW',JSON.stringify(row));}
console.log('ENTITIES',JSON.stringify(Object.values(bot.entities).filter(e=>e.position.distanceTo(bot.entity.position)<16).map(e=>[e.name,e.username,e.position])));

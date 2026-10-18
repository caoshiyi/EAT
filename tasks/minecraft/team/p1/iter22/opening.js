bot.pathfinder.setGoal(null);bot.clearControlStates();
const p=bot.entity.position.clone(),hp=bot.health;
console.log('STATE',JSON.stringify({p,hp,food:bot.food,dim:bot.game.dimension,inventory:bot.inventory.items().map(i=>[i.name,i.count]),ground:bot.entity.onGround,controls:bot.controlState,goal:bot.pathfinder.goal}));
console.log('NEAR',JSON.stringify(bot.findBlocks({matching:b=>['oak_planks','crafting_table','chest','cobweb'].includes(b.name),maxDistance:20,count:40}).map(p=>({p,n:bot.blockAt(p).name}))));
console.log('FOES',JSON.stringify(Object.values(bot.entities).filter(e=>e.position.distanceTo(p)<16&&e.type==='mob').map(e=>({id:e.id,n:e.name,p:e.position}))));
console.log('GRID',JSON.stringify([[0,-1,0],[0,2,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]].map(a=>{const q=p.floored().offset(...a);return {p:q,n:bot.blockAt(q)?.name}})));
await bot.waitForTicks(40); return {p:bot.entity.position,hp:bot.health,stable:hp===bot.health,ground:bot.entity.onGround,controls:bot.controlState,goal:bot.pathfinder.goal};

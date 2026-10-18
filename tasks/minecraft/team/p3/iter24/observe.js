console.log('FRESH',JSON.stringify({pos:bot.entity.position,health:bot.health,food:bot.food,dimension:bot.game.dimension,inventory:bot.inventory.items().map(i=>({name:i.name,count:i.count})),controls:bot.controlState,goal:bot.pathfinder.goal}));
const p=bot.entity.position.floored();
for(let y=-2;y<=3;y++) {let a=[];for(let z=-3;z<=3;z++)for(let x=-3;x<=3;x++){let b=bot.blockAt(p.offset(x,y,z));a.push([x,y,z,b?.name,b?.boundingBox]);}console.log('LAYER',y,JSON.stringify(a));}
console.log('NEAR',JSON.stringify(Object.values(bot.entities).filter(e=>e!==bot.entity&&e.position.distanceTo(bot.entity.position)<24).map(e=>({name:e.name,type:e.type,pos:e.position,d:e.position.distanceTo(bot.entity.position)}))));
return 'observation only';

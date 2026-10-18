bot.clearControlStates(); bot.pathfinder.setGoal(null);
const p=bot.entity.position;const o=p.floored();
const cells=[];for(let y=-1;y<=2;y++)for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){const b=bot.blockAt(o.offset(x,y,z));cells.push({p:[o.x+x,o.y+y,o.z+z],n:b?.name,box:b?.boundingBox,seen:b?bot.canSeeBlock(b):false});}
console.log(JSON.stringify({pos:p,health:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>({name:i.name,count:i.count})),entities:Object.values(bot.entities).filter(e=>e!==bot.entity&&e.position.distanceTo(p)<16).map(e=>({name:e.name,pos:e.position})),cells}));

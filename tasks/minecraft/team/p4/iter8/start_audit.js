bot.clearControlStates();bot.pathfinder.setGoal(null);
const p=bot.entity.position;console.log('START',JSON.stringify({pos:p,hp:bot.health,food:bot.food,items:bot.inventory.items().map(i=>({name:i.name,count:i.count})),controls:bot.controlState,timeOfDay:bot.time.timeOfDay,dimension:bot.game.dimension}));
console.log('ENTITIES',JSON.stringify(Object.values(bot.entities).filter(e=>e.position.distanceTo(p)<60).map(e=>({id:e.id,name:e.name,type:e.type,kind:e.kind,pos:e.position,d:e.position.distanceTo(p)}))));
console.log('FOODBLOCKS',JSON.stringify(bot.findBlocks({matching:b=>/berry|wheat|carrots|potatoes|melon|pumpkin|mushroom|log$/.test(b.name),maxDistance:64,count:40}).map(v=>({pos:v,name:bot.blockAt(v)?.name,props:bot.blockAt(v)?.getProperties()}))));
console.log('DOORS',JSON.stringify([6,7].map(x=>{let b=bot.blockAt(p.offset(x-p.x,67-p.y,81-p.z).floored());return {pos:b?.position,name:b?.name,props:b?.getProperties()}})));

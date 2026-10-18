const V=require('vec3').Vec3;
const items=Object.values(bot.entities).filter(e=>e.name==='item').map(e=>({id:e.id,p:e.position,item:typeof e.getDroppedItem==='function'?e.getDroppedItem():null}));
const relevantNames=['chest','barrel','wheat','carrots','potatoes','sweet_berry_bush','chorus_plant','chorus_flower','cobweb'];
const blocks=bot.findBlocks({matching:b=>relevantNames.includes(b.name),maxDistance:64,count:30}).map(p=>({p,n:bot.blockAt(p)?.name}));
console.log(JSON.stringify({dimension:bot.game.dimension,p:bot.entity.position,hp:bot.health,food:bot.food,items,blocks,inventory:bot.inventory.items().map(i=>({name:i.name,count:i.count})),players:Object.entries(bot.players).map(([n,p])=>({n,p:p.entity?.position}))}));

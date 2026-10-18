const V=require('vec3').Vec3;const p=new V(133,-37,2272),b=bot.blockAt(p);
if(b.name!=='oak_planks'||bot.entity.position.x>132.7)return {refused:'not safe original stance'};
await bot.lookAt(p.offset(.35,.95,.65),true);await bot.waitForTicks(2);const h=bot.blockAtCursor(4.5);if(!h||!h.position.equals(p))return {refused:'not visible',hit:h&&h.position};
await bot.dig(b,false,'raycast');await bot.waitForTicks(30);
return {block:bot.blockAt(p).name,pos:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count})),items:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<3).map(e=>({id:e.id,p:e.position,meta:e.metadata}))};

const V=require('vec3').Vec3,ref=bot.blockAt(new V(141,-37,2231)),p=new V(141,-36,2231);
if(bot.blockAt(p).boundingBox!=='empty')return {refused:'occupied'};await bot.lookAt(new V(141.65,-36.001,2231.65),true);await bot.waitForTicks(2);const h=bot.blockAtCursor(4.5);
if(!h||!h.position.equals(ref.position)||h.face!==1)return {refused:'not direct top',hit:h&&h.position};
await bot.equip(bot.inventory.items().find(i=>i.name==='torch'),'hand');await bot.placeBlock(ref,new V(0,1,0));await bot.waitForTicks(3);return {actual:bot.blockAt(p).name,pos:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count}))};

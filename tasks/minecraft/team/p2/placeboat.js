const {Vec3}=require('vec3');await bot.equip(bot.inventory.items().find(i=>i.name==='spruce_boat'),'hand');
try{const b=await bot.placeEntity(bot.blockAt(new Vec3(6,62,124)),new Vec3(0,1,0));console.log('placed',b.id,b.position);}catch(e){console.log('placement',e.message);}
console.log('boats',Object.values(bot.entities).filter(e=>e.name?.includes('boat')).map(e=>({id:e.id,p:e.position})));
console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));

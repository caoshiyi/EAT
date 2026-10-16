const {Vec3}=require('vec3');bot.clearControlStates();await bot.waitForTicks(10);
await bot.craft(bot.recipesFor(bot.registry.itemsByName.spruce_planks.id,null,1,null)[0],1,null);
await bot.craft(bot.recipesFor(bot.registry.itemsByName.crafting_table.id,null,1,null)[0],1,null);
const p=bot.entity.position.floored();let ref;
for(let dx=-1;dx<=1&&!ref;dx++)for(let dz=-1;dz<=1&&!ref;dz++){const b=bot.blockAt(p.offset(dx,-1,dz));if(b?.boundingBox==='block'&&bot.blockAt(b.position.offset(0,1,0))?.boundingBox==='empty'&&(dx||dz))ref=b;}
if(!ref)throw Error('no safe table support');
await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');await bot.placeBlock(ref,new Vec3(0,1,0));const table=bot.blockAt(ref.position.offset(0,1,0));console.log('table',table.position);
const r=bot.recipesFor(bot.registry.itemsByName.spruce_boat.id,null,1,table)[0];if(!r)throw Error('boat recipe missing');await bot.craft(r,1,table);console.log('inv',bot.inventory.items().map(i=>[i.name,i.count]));
console.log('water',bot.findBlocks({matching:bot.registry.blocksByName.water.id,maxDistance:12,count:8}));

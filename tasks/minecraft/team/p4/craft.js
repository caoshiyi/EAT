async function craft(name,n,table=null){const id=bot.registry.itemsByName[name].id;const r=bot.recipesFor(id,null,1,table)[0];if(!r)throw Error('no recipe '+name);await bot.craft(r,n,table);}
await craft('spruce_planks',4);await craft('crafting_table',1);await craft('stick',2);
const v=bot.entity.position.floored();const supports=[v.offset(0,-1,1),v.offset(1,-1,0),v.offset(-1,-1,0),v.offset(0,-1,-1)];
let table=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:5});
if(!table){const s=supports.map(p=>bot.blockAt(p)).find(b=>b&&b.boundingBox==='block'&&bot.blockAt(b.position.offset(0,1,0)).name==='air');if(!s)throw Error('no support');await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');await bot.placeBlock(s,new (require('vec3').Vec3)(0,1,0));table=bot.blockAt(s.position.offset(0,1,0));}
await craft('wooden_pickaxe',1,table);console.log('table',table.position.toString(),'inventory',bot.inventory.items().map(i=>[i.name,i.count]));

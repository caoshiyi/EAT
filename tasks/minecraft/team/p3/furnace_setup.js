const {Vec3}=require('vec3');
const t=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:6});if(!t)throw Error('need nearby table');
const r=bot.recipesFor(bot.registry.itemsByName.furnace.id,null,1,t)[0];if(!r)throw Error('need8cobble');await bot.craft(r,1,t);
const p=bot.entity.position.floored();let base;
for(const d of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){
const b=bot.blockAt(p.offset(d[0],-1,d[1])),a=bot.blockAt(p.offset(d[0],0,d[1]));if(b?.boundingBox==='block'&&a?.name==='air'){base=b;break;}}
if(!base)throw Error('no placement support');await bot.equip(bot.inventory.items().find(i=>i.name==='furnace'),'hand');await bot.placeBlock(base,new Vec3(0,1,0));
const fb=bot.blockAt(base.position.offset(0,1,0));console.log('furnace',fb.name,fb.position);
const f=await bot.openFurnace(fb);const ore=bot.inventory.items().find(i=>i.name==='raw_iron');await f.putInput(ore.type,null,ore.count);
const fuel=bot.inventory.items().find(i=>i.name==='coal')||bot.inventory.items().find(i=>i.name==='spruce_planks');if(fuel)await f.putFuel(fuel.type,null,fuel.count);
console.log('loaded',f.inputItem(),f.fuelItem(),f.outputItem());f.close();return bot.inventory.items().map(i=>[i.name,i.count]);

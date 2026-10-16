const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
async function craft(n,c=1,t=null){const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,t)[0];if(!r)throw Error('no recipe '+n);await bot.craft(r,c,t);console.log('crafted',n,count(n));}
if(count('spruce_log'))await craft('spruce_planks',count('spruce_log'));
if(!count('crafting_table')&&!bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:4}))await craft('crafting_table');
let t=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:4});
if(!t){const base=bot.blockAt(bot.entity.position.floored().offset(1,-1,0));await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');await bot.placeBlock(base,require('vec3').Vec3(0,1,0));t=bot.blockAt(base.position.offset(0,1,0));console.log('table placed',t.name,t.position);}
if(count('stick')<4)await craft('stick',1);
if(!count('wooden_pickaxe')&&!count('stone_pickaxe'))await craft('wooden_pickaxe',1,t);
return {table:t.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

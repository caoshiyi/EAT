const log=bot.inventory.items().find(i=>i.name==='spruce_log');if(log){const r=bot.recipesFor(bot.registry.itemsByName.spruce_planks.id,null,1,null)[0];await bot.craft(r,log.count,null);}
bot.pathfinder.setGoal(null);bot.clearControlStates();const m=new Movements(bot);m.canDig=false;m.maxDropDown=1;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1600;
const table=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:20});if(!table)throw Error('no table');try{await bot.pathfinder.goto(new goals.GoalNear(table.position.x,table.position.y,table.position.z,2));}catch(e){console.log('path',e.message);bot.pathfinder.setGoal(null);}
console.log('position',bot.entity.position.toString());
async function craft(n,c=1){const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('no recipe '+n);await bot.craft(r,c,table);}
await craft('chest');await craft('wooden_pickaxe');
const {Vec3}=require('vec3');for(const d of [new Vec3(0,0,1),new Vec3(1,0,0),new Vec3(0,0,-1),new Vec3(-1,0,0)]){const p=table.position.plus(d);if(bot.blockAt(p).name==='air'){await bot.equip(bot.inventory.items().find(i=>i.name==='chest'),'hand');await bot.placeBlock(table,d);console.log('CHEST',p.toString());global.p4chest=p;break;}}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

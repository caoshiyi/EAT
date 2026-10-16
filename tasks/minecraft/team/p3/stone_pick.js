const m=new Movements(bot);m.canDig=true;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
const ds=Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<8&&e.getDroppedItem?.()?.name==='cobblestone');
if(ds[0])await bot.pathfinder.goto(new goals.GoalNear(ds[0].position.x,ds[0].position.y,ds[0].position.z,0.7));await bot.waitForTicks(10);
let t=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:12});await bot.pathfinder.goto(new goals.GoalNear(t.position.x,t.position.y,t.position.z,2));
async function craft(n,c=1,table=null){let r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('no recipe '+n);await bot.craft(r,c,table);}
if(bot.inventory.items().some(i=>i.name==='spruce_log'))await craft('spruce_planks');
if(!bot.inventory.items().some(i=>i.name==='stick'))await craft('stick');
await craft('stone_pickaxe',1,t);return bot.inventory.items().map(i=>[i.name,i.count]);

const m=new Movements(bot);m.canDig=true;m.maxDropDown=3;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2000;
let timer=setTimeout(()=>bot.pathfinder.setGoal(null),14000);try{await bot.pathfinder.goto(new goals.GoalNear(10,69,-35,2));}catch(e){console.log('return',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);}
if(bot.entity.position.distanceTo(new (require('vec3').Vec3)(10,69,-35))>5)throw Error('not near furnace; stopped before interaction');
const fb=bot.blockAt(new (require('vec3').Vec3)(10,69,-35));const f=await bot.openFurnace(fb);console.log('furnace',f.inputItem()?.count,f.outputItem()?.count,f.fuelItem()?.count);if(f.outputItem())await f.takeOutput();f.close();
const t=bot.findBlock({matching:bot.registry.blocksByName.crafting_table.id,maxDistance:5});
async function craft(n,c=1){const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,t)[0];if(!r)throw Error('no recipe '+n);await bot.craft(r,c,t);}
await craft('bucket',2);if(bot.inventory.items().some(i=>i.name==='flint'))await craft('flint_and_steel');
return bot.inventory.items().map(i=>[i.name,i.count]);

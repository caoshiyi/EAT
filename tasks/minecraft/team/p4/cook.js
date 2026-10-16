bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
let b=bot.findBlock({matching:bot.registry.blocksByName.furnace.id,maxDistance:32});if(!b)throw Error('no furnace');
try{await bot.pathfinder.goto(new goals.GoalNear(b.position.x,b.position.y,b.position.z,2));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}
const f=await bot.openFurnace(b);console.log('slots',f.inputItem()?.name,f.outputItem()?.name,f.fuelItem()?.name);
if(f.inputItem()||f.outputItem()){f.close();throw Error('furnace occupied, leave for p3');}
const coal=bot.inventory.items().find(i=>i.name==='coal');if(coal)await f.putFuel(coal.type,null,1);
const food=bot.inventory.items().find(i=>i.name==='chicken');if(food)await f.putInput(food.type,null,food.count);
console.log('loaded',f.inputItem()?.name,f.inputItem()?.count);f.close();bot.chat('p4 using idle spawn furnace for chicken3 now. Please preserve cooking output; p4 will collect.');

const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();
const chest=await bot.openContainer(bot.blockAt(new Vec3(10,66,-35)));console.log('chest contents',chest.containerItems().map(i=>[i.name,i.count]));chest.close();
const f=await bot.openFurnace(bot.blockAt(new Vec3(11,66,-35)));console.log('slots',f.inputItem()?.name,f.outputItem()?.name,f.fuelItem()?.name);if(!f.inputItem()&&!f.outputItem()){await f.putFuel(bot.registry.itemsByName.spruce_planks.id,null,3);await f.putInput(bot.registry.itemsByName.chicken.id,null,3);}f.close();
bot.chat('p3 chest7iron VERIFIED at(10,66,-35), table(10,66,-36), furnace(11,66,-35). Please withdraw iron and deposit3cobble for p4 stonepick. Furnace cooking3chicken; p4 will collect. Safe same-level base now.');

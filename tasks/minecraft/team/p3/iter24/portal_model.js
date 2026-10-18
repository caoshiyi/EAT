const f=bot.inventory.items().find(i=>i.name==='sweet_berries');if(bot.food<19&&f){await bot.equip(f,'hand');await bot.consume();}
const r=bot.recipesFor(bot.registry.itemsByName.spruce_planks.id,null,1,null)[0];if(r)await bot.craft(r,1,null);
console.log('STATE',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));
const ps=bot.findBlocks({matching:bot.registry.blocksByName.nether_portal.id,maxDistance:32,count:20});console.log('PORTAL',ps);
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.maxDropDown=2;for(const n of['water','lava','sweet_berry_bush','powder_snow'])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);
for(const t of [[6,68,90],[6,64,97],[7,68,91]]){const goal=new goals.GoalBlock(...t);let result;const gen=bot.pathfinder.getPathFromTo(m,bot.entity.position,goal,{timeout:2000,tickTimeout:100});for(let k=0;k<30;k++){let q=gen.next(),v=q.value?.result||q.value;if(v?.status)result=v;if(q.done||v?.status!=='partial')break;}console.log('MODEL',t,result?.status,JSON.stringify(result?.path?.map(p=>[p.x,p.y,p.z])));}

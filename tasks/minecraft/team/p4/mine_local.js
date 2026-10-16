bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const m=new Movements(bot);m.canDig=true;m.maxDropDown=2;for(const n of ['crafting_table','furnace','chest'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=2000;
const end=Date.now()+26000;for(let n=0;n<8&&Date.now()<end;n++){
 const bs=bot.findBlocks({matching:[bot.registry.blocksByName.iron_ore.id,bot.registry.blocksByName.coal_ore.id],maxDistance:5,count:80}).map(p=>bot.blockAt(p)).filter(b=>bot.canDigBlock(b)).sort((a,b)=>(a.name==='iron_ore'?0:100)+(a.position.distanceTo(bot.entity.position))-(b.name==='iron_ore'?0:100)-b.position.distanceTo(bot.entity.position));
 const b=bs[0];if(!b)break;const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe');if(!pick)throw Error('pick missing');await bot.equip(pick,'hand');console.log('dig',b.name,b.position.toString());await bot.dig(b);await bot.waitForTicks(20);
 const drops=Object.values(bot.entities).filter(e=>e.name==='item'&&['raw_iron','coal'].includes(e.getDroppedItem?.()?.name)&&e.position.distanceTo(bot.entity.position)<7);
 for(const d of drops){const target=d.position.clone();const timer=setTimeout(()=>bot.pathfinder.setGoal(null),3500);try{await bot.pathfinder.goto(new goals.GoalNear(target.x,target.y,target.z,.6));}catch(e){console.log('pickup',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);await bot.waitForTicks(4);}}
 console.log('resources',bot.inventory.items().filter(i=>['raw_iron','coal'].includes(i.name)).map(i=>[i.name,i.count]),'pos',bot.entity.position.toString());if(bot.health<10)break;
}
console.log('final',bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));

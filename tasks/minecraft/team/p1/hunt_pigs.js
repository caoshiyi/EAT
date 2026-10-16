bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const shield=bot.inventory.items().find(i=>i.name==='shield');if(shield)await bot.equip(shield,'off-hand');
const m=new Movements(bot);m.canDig=true;m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;for(const n of ['chest','crafting_table','furnace'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
const end=Date.now()+42000;
for(let k=0;k<4&&Date.now()<end;k++){
 const target=Object.values(bot.entities).filter(e=>e.name==='pig'&&e.position.distanceTo(bot.entity.position)<24).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];if(!target)break;
 for(let j=0;j<7&&bot.entities[target.id]&&Date.now()<end;j++){
 let t;try{await Promise.race([bot.pathfinder.goto(new goals.GoalNear(target.position.x,target.position.y,target.position.z,1.5)),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('chase bound'))},3500))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null)}
 if(target.position.distanceTo(bot.entity.position)<3.4){const pick=bot.inventory.items().find(i=>i.name==='iron_pickaxe');if(pick)await bot.equip(pick,'hand');await bot.lookAt(target.position.offset(0,.6,0));bot.attack(target);await bot.waitForTicks(19)}
 }
 console.log('pig disappeared',!bot.entities[target.id]);
 for(const e of Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5)){let t;try{await Promise.race([bot.pathfinder.goto(new goals.GoalNear(e.position.x,e.position.y,e.position.z,.6)),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('pickup bound'))},2500))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null)}await bot.waitForTicks(8)}
}
bot.clearControlStates();console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]),'position',bot.entity.position,'health',bot.health,'food',bot.food);

const V=bot.entity.position.constructor,home=new V(6.5,67,82.5);
console.log('SOURCE',new Date().toISOString(),bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));
if(bot.entity.position.distanceTo(home)>.3||bot.health>3)throw Error('source mismatch');
for(const [a,name] of [[[6,67,83],'white_bed'],[[7,67,83],'white_bed'],[[7,68,82],'chest'],[[6,66,82],'crafting_table'],[[6,69,82],'spruce_slab']])if(bot.blockAt(new V(...a))?.name!==name)throw Error('fixture mismatch '+a);
const mobs=Object.values(bot.entities).filter(e=>e.name==='creeper'&&e.position.y<62&&e.position.distanceTo(home)<10);console.log('ADMITTED_MOBS',mobs.map(e=>[e.id,e.position]));if(!mobs.length)throw Error('hostile branch no longer available');
for(const [p,name] of [[new V(5,68,82),'sand'],[new V(5,67,82),'dirt']]){const b=bot.blockAt(p);if(b.name!==name)throw Error('door changed '+b.name);await bot.dig(b);await bot.waitForTicks(12);}
const c=await bot.openChest(bot.blockAt(new V(7,68,82)));for(const i of bot.inventory.items())await c.deposit(i.type,null,i.count);console.log('BANK',c.containerItems().map(i=>[i.name,i.count]));c.close();await bot.waitForTicks(10);if(bot.inventory.items().length)throw Error('unbanked resource');
let died=false;const d=()=>{died=true;bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('DEATH',new Date().toISOString());};bot.on('death',d);
try{
 await bot.lookAt(new V(2.5,68.62,82.5),true);bot.setControlState('forward',true);for(let k=0;k<27&&!died;k++)await bot.waitForTicks(1);bot.clearControlStates();
 if(!died){const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.maxDropDown=5;bot.pathfinder.setMovements(m);bot.pathfinder.setGoal(new goals.GoalNear(7,60,82,1));}
 for(let k=0;k<240;k++){await bot.waitForTicks(1);if(k%20===0)console.log('PHASE',k,bot.entity.position,bot.health,died);if(died&&bot.health>0&&bot.entity.position.distanceTo(home)<1)break;}
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(25);console.log('END',JSON.stringify({died,pos:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count])}));
}finally{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',d);}

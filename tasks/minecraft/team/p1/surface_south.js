bot.pathfinder.setGoal(null);bot.clearControlStates();
const start=bot.entity.position.clone();await bot.lookAt(start.offset(0,0.5,80));bot.setControlState('jump',true);bot.setControlState('forward',true);
for(let i=0;i<240;i++){await bot.waitForTicks(1);if(bot.health<6)break;}
bot.clearControlStates();console.log('surface leg',start.toString(),bot.entity.position.toString(),'hp',bot.health,'food',bot.food,'feet',bot.blockAt(bot.entity.position).name,'under',bot.blockAt(bot.entity.position.offset(0,-1,0)).name);
const animals=Object.values(bot.entities).filter(e=>['pig','cow'].includes(e.name));console.log('animals',animals.map(e=>[e.name,e.position.toString()]));

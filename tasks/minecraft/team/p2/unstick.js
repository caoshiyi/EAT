bot.pathfinder.setGoal(null);bot.clearControlStates();const p=bot.entity.position.floored();
for(const off of [[0,0,0],[0,1,1],[0,0,1],[0,1,2],[0,0,2],[0,2,3]]){const b=bot.blockAt(p.offset(...off));if(b&&b.boundingBox!=='empty'&&bot.entity.position.distanceTo(b.position)<4.8){console.log('dig',b.name,b.position);try{await bot.dig(b);}catch(e){console.log(e.message);}}}
await bot.lookAt(bot.entity.position.offset(0,0,10),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(80);bot.clearControlStates();console.log('pos',bot.entity.position);

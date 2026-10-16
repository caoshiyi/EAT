bot.pathfinder.setGoal(null);bot.clearControlStates();
for(let i=0;i<4;i++){
await bot.lookAt(bot.entity.position.offset(0,0,30),true);bot.setControlState('forward',true);bot.setControlState('jump',true);await bot.waitForTicks(80);bot.clearControlStates();console.log('p',bot.entity.position,'health',bot.health,'food',bot.food,'oxygen',bot.oxygenLevel);
if(bot.health<14)break;
}
for(const name of ['hay_block','bell','chest','wheat','spruce_log','oak_log']){const id=bot.registry.blocksByName[name]?.id;if(id)console.log(name,bot.findBlocks({matching:id,maxDistance:96,count:5}));}
console.log('villagers',Object.values(bot.entities).filter(e=>e.name==='villager').map(e=>e.position));

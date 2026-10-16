bot.pathfinder.stop();const p=bot.players.p3?.entity;console.log('recipient',p?.position.toString());
if(p){await bot.lookAt(p.position.offset(0,0.3,0));await bot.toss(bot.registry.itemsByName.wooden_pickaxe.id,null,1);bot.setControlState('back',true);await bot.waitForTicks(12);bot.clearControlStates();await bot.waitForTicks(20);}
console.log('p4 inventory',bot.inventory.items().map(i=>[i.name,i.count]));bot.chat('p3 pick tossed again downward toward your current position. First toss repicked by p4; please verify received. p4 will gather north/west food next.');

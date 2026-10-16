bot.pathfinder.stop();const m=new Movements(bot);m.canDig=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
try{await bot.pathfinder.goto(new goals.GoalNear(9,70,-37,0.8));}catch(e){console.log('move',e.message)}
console.log('position',bot.entity.position.toString());
const p=bot.players.p3?.entity;console.log('p3',p?.position.toString());
if(p&&p.position.distanceTo(bot.entity.position)<2){await bot.lookAt(p.position.offset(0,0.3,0));await bot.toss(bot.registry.itemsByName.wooden_pickaxe.id,null,1);bot.setControlState('back',true);await bot.waitForTicks(8);bot.clearControlStates();}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

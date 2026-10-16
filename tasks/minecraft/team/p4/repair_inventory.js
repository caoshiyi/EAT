bot.pathfinder.setGoal(null);bot.clearControlStates();
if(bot.inventory.selectedItem){const empty=bot.inventory.slots.findIndex((i,n)=>n>=9&&n<=44&&!i);if(empty<0)throw Error('no empty slot');await bot.clickWindow(empty,0,0);}
for(let s=1;s<=4;s++){if(bot.inventory.slots[s])await bot.clickWindow(s,0,1);}
await bot.waitForTicks(5);console.log('cursor',bot.inventory.selectedItem,'grid',bot.inventory.slots.slice(0,5));
const p=bot.players.p3?.entity;console.log('recipient',p?.position.toString());if(p&&p.position.distanceTo(bot.entity.position)<5){await bot.lookAt(p.position.offset(0,0.5,0),true);await bot.toss(bot.registry.itemsByName.iron_ingot.id,null,7);bot.setControlState('back',true);await bot.waitForTicks(8);bot.clearControlStates();}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

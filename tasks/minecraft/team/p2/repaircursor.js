if(bot.currentWindow)bot.closeWindow(bot.currentWindow);await bot.waitForTicks(4);
if(bot.inventory.selectedItem){const slot=bot.inventory.slots.findIndex((it,i)=>i>=9&&i<45&&!it);if(slot<0)throw Error('no free cursor slot');console.log('repair cursor',bot.inventory.selectedItem.name,'to',slot);await bot.clickWindow(slot,0,0);await bot.waitForTicks(4);}
console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]),'cursor',bot.inventory.selectedItem?.name);

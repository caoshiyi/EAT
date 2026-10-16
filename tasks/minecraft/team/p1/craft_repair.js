if(bot.currentWindow)bot.closeWindow(bot.currentWindow);
const w=bot.inventory;
if(w.selectedItem){const slot=Array.from({length:36},(_,i)=>i+9).find(s=>!w.slots[s]);if(slot===undefined)throw Error('no cursorparking');await bot.clickWindow(slot,0,0);await bot.waitForTicks(5)}
console.log('beforegrid',w.slots.slice(0,5).map(i=>i&&[i.name,i.count]),'cursor',w.selectedItem?.name);
if(w.slots[0]){await bot.clickWindow(0,0,1);await bot.waitForTicks(8)}
for(let i=1;i<=4;i++)if(w.slots[i]){await bot.clickWindow(i,0,1);await bot.waitForTicks(5)}
console.log('aftergrid',w.slots.slice(0,5).map(i=>i&&[i.name,i.count]),'cursor',w.selectedItem?.name,'inventory',bot.inventory.items().map(i=>[i.name,i.count]));

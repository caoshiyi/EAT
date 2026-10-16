console.log('grid',bot.inventory.slots.slice(0,9).map((i,s)=>i?{s,name:i.name,count:i.count}:null),'cursor',bot.inventory.selectedItem);
if(bot.inventory.selectedItem){const e=bot.inventory.slots.findIndex((i,s)=>s>=9&&s<45&&!i);await bot.clickWindow(e,0,0);}
if(bot.inventory.slots[0]?.name==='spruce_planks'){await bot.clickWindow(0,0,1);await bot.waitForTicks(8);}
console.log('after',bot.inventory.items().map(i=>[i.name,i.count]),'grid',bot.inventory.slots.slice(0,5).map((i,s)=>i?{s,name:i.name,count:i.count}:null),'cursor',bot.inventory.selectedItem);

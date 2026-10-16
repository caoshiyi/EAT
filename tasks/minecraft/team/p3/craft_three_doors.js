const{Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();if(bot.entity.position.z<82.3||bot.health<18)throw Error('inside healthy start');
async function cleanCraft(){if(bot.currentWindow){await bot.closeWindow(bot.currentWindow);await bot.waitForTicks(4);}if(bot.inventory.selectedItem){const s=bot.inventory.slots.findIndex((i,s)=>s>=9&&s<=44&&!i);if(s<0)throw Error('no cursor slot');await bot.clickWindow(s,0,0);await bot.waitForTicks(6);}for(let s=1;s<=4;s++)if(bot.inventory.slots[s]){await bot.clickWindow(s,0,1);await bot.waitForTicks(4);}if(bot.inventory.selectedItem||bot.inventory.slots.slice(1,5).some(Boolean))throw Error('craft state not clean');}
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
async function once(n,table=null){await cleanCraft();const before=count(n),r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('no actual recipe '+n);await bot.craft(r,1,table);await bot.waitForTicks(8);await cleanCraft();console.log('CRAFT POST',n,before,count(n));if(count(n)<=before)throw Error('no output gain '+n);}

while(count('spruce_planks')<8)await once('spruce_planks');
await once('spruce_door',bot.blockAt(new Vec3(6,66,82)));
console.log('THREE DOORS VERIFIED',count('spruce_door'),'PLANKS',count('spruce_planks'),'CURSOR',bot.inventory.selectedItem);
if(count('spruce_door')!==3)throw Error('expected3actualdoors');
bot.deactivateItem();const food=bot.inventory.items().find(i=>i.name==='sweet_berries');if(bot.food<20&&food){await bot.equip(food,'hand');await bot.waitForTicks(8);await bot.consume();await bot.waitForTicks(10);}console.log('FINAL KIT',bot.inventory.items().map(i=>[i.name,i.count]),bot.health,bot.food);

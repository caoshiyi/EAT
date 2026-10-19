const n=()=>bot.inventory.items().filter(i=>i.name==='oak_planks').reduce((a,i)=>a+i.count,0);
let t=Date.now();while(n()<1&&Date.now()-t<20000)await bot.waitForTicks(2);
console.log('WOOD_NATIVE',n(),bot.health,bot.entity.position,bot.inventory.slots.slice(9,45).filter(i=>!i).length);
if(n()>=1)bot.chat('P3WOOD1nativeACK count'+n()+' HP'+bot.health+' fixedreceiver; P2deliverremaining6sameinterfaceNOW thenretreatNORTHz2 beforeP3Tableplacement.');

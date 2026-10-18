const p=bot.players.p1&&bot.players.p1.entity;
if(!p||p.position.distanceTo(bot.entity.position)>1.6||Math.abs(p.position.y-bot.entity.position.y)>.1)return {refused:'recipient absent/incompatible',p:p&&p.position};
const before=bot.inventory.items().filter(i=>i.name==='basalt').reduce((s,i)=>s+i.count,0);
await bot.lookAt(p.position.offset(.05,.6,.05),true);await bot.waitForTicks(2);
console.log('GIFT_PRE',JSON.stringify({donor:bot.entity.position,recipient:p.position,distance:p.position.distanceTo(bot.entity.position),before}));
const it=bot.inventory.items().find(i=>i.name==='basalt');await bot.toss(it.type,null,1);
await bot.waitForTicks(35);
return {before,after:bot.inventory.items().filter(i=>i.name==='basalt').reduce((s,i)=>s+i.count,0),hp:bot.health,pos:bot.entity.position,recipient:p.position,items:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5).map(e=>({id:e.id,p:e.position,meta:e.metadata}))};

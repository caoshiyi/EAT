const m=new Movements(bot); m.canDig=false; bot.pathfinder.setMovements(m);
for(let k=0;k<5;k++){
const b=bot.findBlock({matching:b=>b.name==='spruce_log',maxDistance:15}); if(!b)break;
await bot.pathfinder.goto(new goals.GoalNear(b.position.x,b.position.y,b.position.z,2));
const p=b.position.clone(); await bot.dig(bot.blockAt(p)); console.log('dug',p,'now',bot.blockAt(p).name);
await bot.pathfinder.goto(new goals.GoalNear(p.x,p.y,p.z,1)); await bot.waitForTicks(8);
}
return bot.inventory.items().map(i=>[i.name,i.count]);

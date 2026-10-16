const m=new Movements(bot);m.canDig=true;m.maxDropDown=3;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=3000;
let timer=setTimeout(()=>bot.pathfinder.setGoal(null),12000);try{await bot.pathfinder.goto(new goals.GoalNear(21,70,-46,2));}catch(e){console.log('approach',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);}
for(let n=0;n<20;n++){
if(bot.inventory.items().some(i=>i.name==='flint'))break;
const bs=bot.findBlocks({matching:bot.registry.blocksByName.gravel.id,maxDistance:5,count:80}).map(p=>bot.blockAt(p)).filter(b=>bot.canDigBlock(b)&&b.position.y>=Math.floor(bot.entity.position.y)-4&&b.position.distanceTo(bot.entity.position)>1.3);if(!bs.length)break;
const b=bs[0];await bot.dig(b);await bot.waitForTicks(5);console.log('dug gravel',b.position);
const ds=Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5&&['gravel','flint'].includes(e.getDroppedItem?.()?.name));
for(const d of ds.slice(0,2)){timer=setTimeout(()=>bot.pathfinder.setGoal(null),2000);try{await bot.pathfinder.goto(new goals.GoalNear(d.position.x,d.position.y,d.position.z,0.6));}catch(e){console.log('pickup',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);}}
}
return {p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

const V=require('vec3').Vec3,m=new Movements(bot),hp=bot.health;const cuts=[];let issue=null;
m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
const allowed=['deepslate','cobbled_deepslate','stone_bricks','cracked_stone_bricks','mossy_stone_bricks'];
try{
 await bot.pathfinder.goto(new goals.GoalBlock(138,-38,2233));
 for(const y of [-37,-38]){const p=new V(139,y,2233),b=bot.blockAt(p);if(bot.health<hp)throw Error('hurt');if(!allowed.includes(b.name))throw Error('unexpected '+b.name);if(Object.values(bot.entities).some(e=>e.type==='hostile'&&e.position.distanceTo(bot.entity.position)<5))throw Error('near hostile');
 await bot.lookAt(p.offset(.015,.6,.6),true);await bot.waitForTicks(2);const h=bot.blockAtCursor(4.5);if(!h||!h.position.equals(p))throw Error('occluded');console.log('PRE',JSON.stringify({p,hit:h.position,n:b.name}));await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');await bot.dig(b,false,'raycast');await bot.waitForTicks(5);cuts.push({p,n:bot.blockAt(p).name});}
 await bot.waitForTicks(10);
}catch(e){issue=String(e);}finally{try{await bot.pathfinder.goto(new goals.GoalBlock(142,-36,2231));}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}}
return {cuts,issue,p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed}))};

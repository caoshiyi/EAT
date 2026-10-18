// Fresh small survival test: one exposed bookshelf, then disposable BOOK1 drop.
// No shared floor/roof removal and no other player's program controlled.
const {Vec3}=require('vec3'),target=new Vec3(139,-35,2232),b=bot.blockAt(target),beforeIds=new Set(Object.keys(bot.entities)),collects=[];
const record=(collector,item)=>collects.push({collector:collector.id,item:item.id,meta:item.metadata});bot.on('playerCollect',record);
try{
if(bot.entity.position.distanceTo(new Vec3(138.5,-37,2232.5))>.3)throw Error('wrong test stance');
await bot.lookAt(target.offset(.1,.25,.5),true);await bot.waitForTicks(4);let c=bot.blockAtCursor(4.5);console.log('CUT_PRE',JSON.stringify({p:bot.entity.position,target:b.name,hit:c&&{p:c.position,face:c.face,intersect:c.intersect}}));
if(b.name!=='bookshelf'||!c||!c.position.equals(target))throw Error('no direct visible bookshelf');
await bot.dig(b,false,'raycast');await bot.waitForTicks(15);let it=bot.inventory.items().find(i=>i.name==='book');if(!it)throw Error('no book receipt');
const source=bot.entity.position.clone(),count=it.count;await bot.lookAt(source.offset(.03,-1,.04),true);await bot.waitForTicks(4);console.log('DROP_PRE',JSON.stringify({source,count,pitch:bot.entity.pitch,yaw:bot.entity.yaw}));await bot.toss(it.type,null,1);
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
try{await bot.pathfinder.goto(new goals.GoalBlock(140,-36,2231))}finally{bot.pathfinder.setGoal(null);bot.clearControlStates()};await bot.waitForTicks(25);
return{source,count,after:bot.inventory.items().map(i=>[i.name,i.count]),p:bot.entity.position,hp:bot.health,collects,newItems:Object.values(bot.entities).filter(e=>e.name==='item'&&!beforeIds.has(String(e.id))&&e.position.distanceTo(source)<7).map(e=>({id:e.id,p:e.position,meta:e.metadata})),note:'Only actual observed coordinates establish where the book landed.'};
}finally{bot.removeListener('playerCollect',record);bot.pathfinder.setGoal(null);bot.clearControlStates()}

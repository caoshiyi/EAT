const V=require('vec3').Vec3;const recipient=bot.players.p1&&bot.players.p1.entity;if(!recipient||recipient.position.distanceTo(bot.entity.position)>1.6)return {refused:'recipient'};
for(const y of [-36,-35])if(bot.blockAt(new V(131,y,2274)).boundingBox!=='empty')return {refused:'retreat body'};
if(!bot.blockAt(new V(131,-37,2274)).shapes.some(s=>s.join(',')==='0,0,0,1,1,1'))return {refused:'retreat floor'};
const before=bot.inventory.items().filter(i=>i.name==='basalt').reduce((s,i)=>s+i.count,0);
await bot.lookAt(recipient.position.offset(.05,.6,.05),true);await bot.waitForTicks(2);await bot.toss(bot.inventory.items().find(i=>i.name==='basalt').type,null,1);
try{for(let i=0;i<25;i++){if(bot.health<20)throw Error('hurt');if(bot.entity.position.z>=2274.38)break;await bot.lookAt(new V(131.5,-34.38,2274.5),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}finally{bot.clearControlStates();}
await bot.waitForTicks(50);return {before,after:bot.inventory.items().filter(i=>i.name==='basalt').reduce((s,i)=>s+i.count,0),pos:bot.entity.position,hp:bot.health,recipient:recipient.position,items:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5).map(e=>({p:e.position,metadata:e.metadata}))};

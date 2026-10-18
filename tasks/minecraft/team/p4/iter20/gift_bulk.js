const V=require('vec3').Vec3;const recipient=bot.players.p1&&bot.players.p1.entity;
if(!recipient||recipient.position.distanceTo(new V(131.5,-36,2272.5))>.3)return {refused:'recipient moved'};
for(const z of [2273,2274]){for(const y of [-36,-35])if(bot.blockAt(new V(131,y,z)).boundingBox!=='empty')return {refused:'body'};if(!bot.blockAt(new V(131,-37,z)).shapes.some(s=>s.join(',')==='0,0,0,1,1,1'))return {refused:'floor'};}
async function walk(z){try{for(let i=0;i<70;i++){if(bot.health<20)throw Error('hurt');if(Math.abs(bot.entity.position.z-z)<.12)break;await bot.lookAt(new V(131.5,-34.38,z),true);bot.setControlState('sneak',true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}finally{bot.clearControlStates();}await bot.waitForTicks(2);}
await walk(2273.5);const before=bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed}));
for(const n of ['basalt','wooden_pickaxe','stick']){
if(recipient.position.distanceTo(new V(131.5,-36,2272.5))>.3)throw Error('recipient moved');
await bot.lookAt(recipient.position.offset(.05,.6,.05),true);const it=bot.inventory.items().find(i=>i.name===n);if(!it)throw Error('missing '+n);await bot.tossStack(it);console.log('TOSSED',n);
}
await walk(2274.6);await bot.waitForTicks(55);
return {before,after:bot.inventory.items().map(i=>({n:i.name,c:i.count})),pos:bot.entity.position,hp:bot.health,recipient:recipient.position};

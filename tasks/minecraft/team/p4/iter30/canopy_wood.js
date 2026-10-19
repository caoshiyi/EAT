const {Vec3}=require('vec3'),src=bot.entity.position.clone(),began=Date.now();
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),near:Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(bot.entity.position)<8).map(e=>({n:e.name,p:e.position.clone()}))});
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('CANOPY_SOURCE',JSON.stringify(snap()));if(src.distanceTo(new Vec3(9.5,73,-23.5))>.2||bot.health!==20)throw Error('source');
for(let k=0;k<4;k++){
const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),qs=bot.findBlocks({matching:b=>b.name==='spruce_log',maxDistance:6,count:30}).filter(q=>q.offset(.5,.5,.5).distanceTo(eye)<=4.5);
let selected=null;for(const q of qs){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);if(bot.blockAtCursor(4.5)?.position.equals(q)){selected=q;break;}}if(selected)break;}
console.log('CANOPY_SELECTION',JSON.stringify({selected,qs}));if(!selected)break;
if(bot.health<20||Date.now()-began>25000)throw Error('health/time');
await bot.dig(bot.blockAt(selected),true,'raycast');await bot.waitForTicks(15);
console.log('CANOPY_RECEIPT',JSON.stringify(snap()));
if(bot.inventory.items().some(i=>i.name==='spruce_log')){const r=bot.recipesFor(bot.registry.itemsByName.spruce_planks.id,null,1,null)[0];if(r)await bot.craft(r,1);console.log('CANOPY_PLANKS',JSON.stringify(snap()));break;}
}
}catch(e){console.log('CANOPY_FAILURE',String(e));}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('CANOPY_END',JSON.stringify(snap()));}
return snap();

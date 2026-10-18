// P3 LIVE read-only loaded entities, no interaction, movement, packet or visibility claim.
const V=bot.entity.position.constructor;
if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(new V(6.5,67,82.5))>.05)throw Error('donor body changed');
const own=()=>({p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))});
const rows=Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(bot.entity.position)<16).map(e=>({id:e.id,n:e.name,user:e.username,type:e.type,p:e.position.clone(),d:e.position.distanceTo(bot.entity.position),item:e.getDroppedItem?.()?{n:e.getDroppedItem().name,count:e.getDroppedItem().count}:null}));
return{at:new Date().toISOString(),own:own(),loadedEntityModels:rows,warning:'Normal loaded model only; no visible/reachable assertion or recovery credit.'};

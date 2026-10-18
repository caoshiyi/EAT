// LIVE P3 small ordinary chest open/read/close test; no item transfer or movement.
const V=bot.entity.position.constructor,p=bot.entity.position.clone();
if(bot.game.dimension!=='overworld'||p.distanceTo(new V(6.5,67,82.5))>.05||bot.health<2)throw Error('unexpected body');
const q=new V(7,68,82),b=bot.blockAt(q);if(b?.name!=='chest')throw Error('chest changed');
await bot.lookAt(q.offset(.5,.5,.5),true);const c=bot.blockAtCursor(4.5);
if(!c?.position.equals(q)||!c.intersect||[bot.entity.eyeHeight,1.8].some(h=>p.offset(0,h,0).distanceTo(c.intersect)>4.5))throw Error('chest not actualvisible/reachable');
let w;try{w=await bot.openChest(b);console.log('CHEST_OPEN',JSON.stringify({at:new Date().toISOString(),p,hp:bot.health,hit:c.intersect,window:{id:w.id,type:w.type,inventoryStart:w.inventoryStart,inventoryEnd:w.inventoryEnd},container:w.containerItems().map(i=>[i.name,i.count,i.slot]),inventory:bot.inventory.items().map(i=>[i.name,i.count])}));}finally{if(w)await bot.closeWindow(w);}
return{at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,window:bot.currentWindow&&{id:bot.currentWindow.id,type:bot.currentWindow.type},inventory:bot.inventory.items().map(i=>[i.name,i.count]),flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

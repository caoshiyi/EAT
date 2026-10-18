// LIVE P3 only, UNEXECUTED until P2 confirms deposit and closes the same chest.
// Small one-block UI test first; this program does NOT break the bed.
const V=bot.entity.position.constructor,base=new V(6.5,67,82.5),chestPos=new V(7,68,82);
function st(){return{at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,window:bot.currentWindow?.type??null,inv:bot.inventory.items().map(i=>[i.name,i.count]),flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};}
console.log('PRE',JSON.stringify(st()));
if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(base)>.05||bot.health<2||!bot.entity.onGround||bot.currentWindow||bot.inventory.items().length)throw Error('fresh donor state mismatch');
const recipient=bot.players.p2?.entity;if(!recipient||recipient.position.distanceTo(chestPos) >6)throw Error('recipient not locally present');
if(bot.blockAt(new V(6,67,83))?.name!=='white_bed'||bot.blockAt(new V(7,67,83))?.name!=='white_bed')throw Error('live bed changed');
await bot.lookAt(chestPos.offset(.5,.5,.5),true);const hit=bot.blockAtCursor(4.5);
if(!hit?.position.equals(chestPos)||!hit.intersect||[bot.entity.eyeHeight,1.8].some(h=>base.offset(0,h,0).distanceTo(hit.intersect)>4.5))throw Error('chest not actualvisible/reachable');
let w;try{w=await bot.openChest(bot.blockAt(chestPos));const item=w.containerItems().find(i=>['dirt','spruce_planks','oak_planks','cobblestone','basalt','netherrack'].includes(i.name));if(!item)throw Error('no deposited full cap block');const before=w.containerItems().filter(i=>i.type===item.type).reduce((n,i)=>n+i.count,0);await w.withdraw(item.type,null,1,null);await bot.waitForTicks(6);const own=bot.inventory.items().filter(i=>i.type===item.type).reduce((n,i)=>n+i.count,0),left=w.containerItems().filter(i=>i.type===item.type).reduce((n,i)=>n+i.count,0);console.log('CAP_WITHDRAW_ACTUAL',JSON.stringify({name:item.name,before,left,own,state:st()}));if(own!==1||left!==before-1)throw Error('actual cap delta failed');}finally{if(w)await bot.closeWindow(w);}
console.log('POST',JSON.stringify(st()));

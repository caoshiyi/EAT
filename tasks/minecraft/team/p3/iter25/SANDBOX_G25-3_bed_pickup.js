// SANDBOX G25-3 P3 ONLY. Stationary visible bed-foot cut and ordinary pickup.
const V=bot.entity.position.constructor,p=bot.entity.position.clone(),startHP=bot.health;
if(bot.game.dimension!=='overworld'||p.distanceTo(new V(6.5,67,82.5))>.05||startHP<2||bot.inventory.items().length)throw Error('snapshot/body/inventory mismatch');
if(['forward','back','left','right','jump','sprint','sneak'].some(k=>bot.getControlState(k)))throw Error('controls not idle');
const foot=new V(6,67,83),head=new V(7,67,83),floor=new V(6,66,83),b=bot.blockAt(foot);
console.log('SANDBOX_G25_3_START',JSON.stringify({at:new Date().toISOString(),p,hp:startHP,food:bot.food,foot:b?.name,footProps:b?.getProperties?.(),head:bot.blockAt(head)?.name,headProps:bot.blockAt(head)?.getProperties?.(),floor:bot.blockAt(floor)?.name,headFloor:bot.blockAt(head.offset(0,-1,0))?.name}));
if(b?.name!=='white_bed'||b.getProperties().part!=='foot'||b.getProperties().facing!=='east'||bot.blockAt(head)?.name!=='white_bed')throw Error('bed pair mismatch');
if(Object.values(bot.entities).some(e=>e.id!==bot.entity.id&&e.position.distanceTo(p)<12&&['skeleton','zombie','creeper','spider','phantom'].includes(e.name)))throw Error('hostile near before opening');
await bot.unequip('hand');await bot.lookAt(foot.offset(.5,.3,.1),true);const c=bot.blockAtCursor(4.5);
if(!c?.position.equals(foot)||!c.intersect||[bot.entity.eyeHeight,1.8].some(h=>p.offset(0,h,0).distanceTo(c.intersect)>4.5))throw Error('actual bed face not visible/reachable');
console.log('BED_CURSOR',JSON.stringify({p:c.position,face:c.face,hit:c.intersect}));
await bot.dig(b,false,'raycast');
for(let i=0;i<30;i++){await bot.waitForTicks(1);if(bot.health<startHP||bot.entity.position.distanceTo(p)>.1)throw Error('body/health changed after cut');if(bot.inventory.items().some(i=>i.name==='white_bed'))break;}
console.log('BED_POST',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,foot:bot.blockAt(foot)?.name,head:bot.blockAt(head)?.name,inventory:bot.inventory.items().map(i=>[i.name,i.count]),drops:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(p)<5).map(e=>({p:e.position,item:e.getDroppedItem?.()?.name,count:e.getDroppedItem?.()?.count})),flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))}));

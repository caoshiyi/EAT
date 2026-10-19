const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),home=v(7,67,-23),opened=[];
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count])});
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return c;}throw Error('not actual visible face '+q);}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('GIFT_SOURCE',JSON.stringify(snap()));
const peer=Object.values(bot.entities).find(e=>e.username==='p2');
console.log('ACTUAL_PEER',JSON.stringify(peer?{id:peer.id,p:peer.position.clone(),d:peer.position.distanceTo(bot.entity.position)}:null));
if(!peer||peer.position.distanceTo(bot.entity.position)>3||!bot.entity.position.floored().equals(home)||bot.health!==20)throw Error('no current safe co-presence');
if(bot.inventory.items().filter(i=>i.name==='sweet_berries').reduce((s,i)=>s+i.count,0)<3)throw Error('no funded berries');
const dx=peer.position.x-bot.entity.position.x,dz=peer.position.z-bot.entity.position.z,windows=[];
if(Math.abs(dx)>.35)windows.push(home.offset(Math.sign(dx),1,0));
if(Math.abs(dz)>.35)windows.push(home.offset(0,1,Math.sign(dz)));
for(const q of windows){if(bot.blockAt(q)?.name!=='spruce_planks')throw Error('unexpected windowmaterial');await face(q);await bot.unequip('hand');await bot.dig(bot.blockAt(q),true,'raycast');opened.push(q);await bot.waitForTicks(3);}
const target=peer.position.offset(0,1.2,0),eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),dv=target.minus(eye);if(peer.position.distanceTo(bot.entity.position)>3||bot.world.raycast(eye,dv.scaled(1/dv.norm()),dv.norm()-.1))throw Error('peer currentray/co-presence changed');
await bot.lookAt(target,true);await bot.waitForTicks(2);await bot.toss(bot.registry.itemsByName.sweet_berries.id,null,3);await bot.waitForTicks(15);console.log('GIFT_DONOR_AFTER',JSON.stringify({state:snap(),peer:peer.position.clone()}));
}catch(e){console.log('GIFT_FAILURE',String(e),JSON.stringify(snap()));}
finally{
for(const q of opened)try{const ref=q.offset(0,-1,0);await face(ref,1);const i=bot.inventory.items().find(i=>i.name==='spruce_planks');if(!i)throw Error('no resealplank');await bot.equip(i,'hand');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));await bot.waitForTicks(3);}catch(e){console.log('GIFT_RESEAL_FAILURE',String(e));}
bot.clearControlStates();bot.pathfinder.setGoal(null);const faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>{const b=bot.blockAt(home.offset(...d));return{p:b?.position,n:b?.name,full:b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')||false}});console.log('GIFT_END',JSON.stringify({state:snap(),faces}));}
return snap();

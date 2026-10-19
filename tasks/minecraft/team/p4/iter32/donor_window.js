const {Vec3}=require('vec3'),q=new Vec3(49,67,112),began=Date.now();
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count])});
const full=p=>bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const source=bot.entity.position.clone(); let opened=false,tossed=[];
function safe(){if(bot.health<=0||bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(source)>.2)throw Error('source changed');}
async function face(p,f=null){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.5,.5,.99]]){await bot.lookAt(p.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(p)&&(f===null||c.face===f))return;}throw Error('cursor unavailable '+p);}
function peerVisible(){const e=bot.players.p2?.entity;if(!e||e.position.distanceTo(bot.entity.position)>3)return null;const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),aim=e.position.offset(0,.2,0),d=aim.minus(eye);if(d.norm()===0||bot.world.raycast(eye,d.scaled(1/d.norm()),Math.max(0,d.norm()-.05)))return null;return {e,aim};}
console.log('SOURCE',JSON.stringify(state()));
try{
safe();if(source.distanceTo(new Vec3(49.509335,66,113.499976))>.1||!full(q)||!full(q.offset(0,-1,0)))throw Error('window admission');
const t=Date.now();let e;
while(Date.now()-t<55000&&Date.now()<Date.parse('2026-10-19T10:44:40Z')){safe();e=bot.players.p2?.entity;if(e&&e.position.distanceTo(source)<3.2&&Math.abs(e.position.x-49.5)<1.2&&e.position.z<113&&e.position.y<=68.2)break;e=null;await bot.waitForTicks(3);}
if(!e)throw Error('receiver admission timeout');
const mobs=Object.values(bot.entities).filter(e=>['zombie','spider','skeleton','creeper','witch'].includes(e.name)&&e.position.distanceTo(source)<8);
if(mobs.length)throw Error('near hostile '+mobs.map(e=>e.name));
console.log('PEER_BEFORE_OPEN',JSON.stringify({at:new Date().toISOString(),p:e.position.clone()}));
await face(q);await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_shovel'),'hand');await bot.dig(bot.blockAt(q),true,'raycast');await bot.waitForTicks(4);opened=!full(q);if(!opened)throw Error('cut post');
const start=Date.now();let peer;
while(Date.now()-start<15000&&Date.now()<Date.parse('2026-10-19T10:44:50Z')){safe();peer=peerVisible();if(peer)break;await bot.waitForTicks(2);}
if(!peer)throw Error('no visible recipient after window');
console.log('VISIBLE_RECEIVER',JSON.stringify({at:new Date().toISOString(),p:peer.e.position.clone(),sender:source}));
for(const [name,count] of [['wooden_sword',1],['wooden_shovel',1],['dirt',4],['spruce_planks',3],['stick',3]]){
safe();peer=peerVisible();if(!peer)throw Error('recipient no longer visible');
const item=bot.inventory.items().find(i=>i.name===name);if(!item||item.count<count)throw Error('item funding '+name);
await bot.lookAt(peer.aim,true);await bot.toss(item.type,null,count);tossed.push([name,count]);await bot.waitForTicks(3);
console.log('SENDER_DEBIT',JSON.stringify({name,count,state:state()}));
}
bot.chat('Donor normalsender toss done; P2 please stepnorth awayfromheadwindow forreclosure, actualrecipientinventory+nextuse required.');
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));}
finally{
bot.pathfinder.setGoal(null);bot.clearControlStates();
if(opened&&!full(q)&&bot.health>0){
try{const t=Date.now();while(Date.now()-t<10000){const e=bot.players.p2?.entity;if(!e||e.position.distanceTo(q.offset(.5,0,.5))>.8)break;await bot.waitForTicks(2);}
await face(q.offset(0,-1,0),1);const dirt=bot.inventory.items().find(i=>i.name==='dirt');if(!dirt)throw Error('cap funding');await bot.equip(dirt,'hand');await bot.placeBlock(bot.blockAt(q.offset(0,-1,0)),new Vec3(0,1,0));await bot.waitForTicks(4);
}catch(e){console.log('RECLOSE_FAILURE',String(e));}
}
for(let k=0;k<3;k++){const p=bot.entity.position.floored(),faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({p:p.offset(...d),n:bot.blockAt(p.offset(...d))?.name,full:full(p.offset(...d))}));console.log('ENDING',JSON.stringify({...state(),faces,tossed,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),goal:bot.pathfinder.goal}));await bot.waitForTicks(4);}
}
return state();

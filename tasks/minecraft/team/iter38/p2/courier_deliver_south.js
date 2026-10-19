const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),wait=n=>bot.waitForTicks(n);
function stop(){bot.pathfinder.setGoal(null);bot.clearControlStates();}
async function move(q){const t=Date.now(),hp=bot.health;for(const dy of[0,1])if(bot.blockAt(q.offset(0,dy,0))?.boundingBox!=='empty')throw Error('BLOCKED '+q.offset(0,dy,0));try{while(Date.now()-t<2300){const p=bot.entity.position,dist=Math.hypot(q.x+.5-p.x,q.z+.5-p.z);if(dist<.12&&p.y===q.y&&bot.entity.onGround)break;if(bot.health<hp)throw Error('HP');await bot.lookAt(v(q.x+.5,p.y+bot.entity.eyeHeight,q.z+.5),true);bot.setControlState('forward',dist>.08);await wait(1);}}finally{stop();}await wait(4);if(!bot.entity.position.floored().equals(q)||!bot.entity.onGround)throw Error('POST');}
stop();try{
if(bot.entity.position.y!==50)throw Error('SOURCE');
await move(v(-3,50,2));await move(v(-3,50,3));
const peer=bot.players.p1?.entity;if(!peer||peer.position.y!==50||peer.position.distanceTo(v(-2.5,50,4.5))>.7)throw Error('P1_NOT_POD');
await bot.lookAt(peer.position.offset(0,.2,0),true);await wait(2);
for(const name of['stone_axe','stone_pickaxe','end_stone']){const item=bot.inventory.items().find(i=>i.name===name);if(!item)throw Error('MISSING '+name);await bot.toss(item.type,null,name==='end_stone'?16:1);}
await move(v(-3,50,2));await wait(45);
console.log('DONOR_SETTLED_NOT_RECEIPT',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count])}));bot.chat('P2 qualifiedSOUTHcourier end now: donorsettled inventorychecked; please nativeP1receipt. P2backnorthrow; no terrainedits.');
}catch(e){console.log('FAILED_ACTUAL_HOLDER',String(e),JSON.stringify({p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])}));}finally{stop();}

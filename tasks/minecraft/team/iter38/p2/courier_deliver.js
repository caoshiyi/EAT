const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),wait=n=>bot.waitForTicks(n);
function stop(){bot.pathfinder.setGoal(null);bot.clearControlStates();}
async function move(q){const t=Date.now(),hp=bot.health;for(const dy of[0,1])if(bot.blockAt(q.offset(0,dy,0))?.boundingBox!=='empty')throw Error('BLOCKED '+q.offset(0,dy,0));try{while(Date.now()-t<2300){const p=bot.entity.position,dist=Math.hypot(q.x+.5-p.x,q.z+.5-p.z);if(dist<.12&&p.y===q.y&&bot.entity.onGround)break;if(bot.health<hp)throw Error('HP');await bot.lookAt(v(q.x+.5,p.y+bot.entity.eyeHeight,q.z+.5),true);bot.setControlState('forward',dist>.08);await wait(1);}}finally{stop();}await wait(4);if(!bot.entity.position.floored().equals(q)||!bot.entity.onGround)throw Error('POST');}
stop();try{
if(!bot.entity.position.floored().equals(v(-5,50,3)))throw Error('SOURCE');
for(const name of ['stone_axe','stone_pickaxe','end_stone'])if(!bot.inventory.items().some(i=>i.name===name))throw Error('MISSING '+name);
for(const q of[v(-5,50,2),v(-4,50,2)])await move(q);
const peer=bot.players.p1?.entity;if(!peer||peer.position.y!==50||peer.position.distanceTo(bot.entity.position)>2.2)throw Error('P1_NOT_ADJACENT');
const gap=peer.position.minus(bot.entity.position);if(bot.world.raycast(bot.entity.position.offset(0,.3,0),gap.normalize(),gap.norm()-.1))throw Error('TOSS_OBSTRUCTION');
await bot.lookAt(peer.position.offset(0,.2,0),true);await wait(2);
for(const name of['stone_axe','stone_pickaxe','end_stone']){const item=bot.inventory.items().find(i=>i.name===name);await bot.toss(item.type,null,name==='end_stone'?16:1);}
await wait(15);console.log('DONOR_END_NOT_RECEIPT',JSON.stringify({p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),p1:bot.players.p1?.entity?.position}));
bot.chat('P2 tools+E16 TOSSED toward actualadjacentP1 northrow-3/z2; P2nativezero donor, awaitingactualP1receipt; no gate edit needed. P2 remains-4/z2 clear escape.');
}catch(e){console.log('FAILED_ACTUAL_HOLDER',String(e),JSON.stringify({p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])}));}finally{stop();}

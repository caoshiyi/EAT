const {Vec3}=require('vec3'),q=new Vec3(49,67,112),start=Date.now();
const full=p=>bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count])});
console.log('SOURCE',JSON.stringify(state()));
if(bot.entity.position.distanceTo(new Vec3(49.509335,66,113.499976))>.1)throw Error('changed source');
try {
while(Date.now()-start<45000&&!full(q)){
 const e=bot.players.p2?.entity;
 if(e&&Math.abs(e.position.x-49.5)<.8&&Math.abs(e.position.z-112.5)<.8&&e.position.y<68){await bot.waitForTicks(3);continue;}
 const ref=q.offset(0,-1,0);if(!full(ref))throw Error('anchor no longer full');
 await bot.lookAt(ref.offset(.5,1,.5),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(ref)||c.face!==1)throw Error('visible top missing');
 const item=bot.inventory.items().find(i=>i.name==='dirt');if(!item)throw Error('funding');
 await bot.equip(item,'hand');await bot.placeBlock(bot.blockAt(ref),new Vec3(0,1,0));await bot.waitForTicks(4);
 if(!full(q))throw Error('reclose post');console.log('RECLOSE_EFFECT',JSON.stringify(state()));break;
}
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));}
bot.clearControlStates();bot.pathfinder.setGoal(null);
for(let k=0;k<3;k++){const p=bot.entity.position.floored();console.log('ENDING',JSON.stringify({...state(),faces:[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({p:p.offset(...d),n:bot.blockAt(p.offset(...d))?.name,full:full(p.offset(...d))}))}));await bot.waitForTicks(4);}
return state();

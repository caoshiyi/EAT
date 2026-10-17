const{Vec3}=require('vec3');const start=Date.now(),original=bot.entity.position.clone(),hp0=bot.health,self=bot.entity;let issueRoute=null,gift=null;const walked=[];
const V=a=>new Vec3(...a),full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=q=>['air','cave_air','torch','wall_torch'].includes(bot.blockAt(q)?.name);
const route=[[146,-36,2242],[145,-36,2242],[144,-36,2242],[143,-36,2242],[142,-36,2242],[141,-36,2242]].map(V);
function check(back=false){if(bot.entity!==self||bot.game.dimension!=='overworld'||bot.health<=0||Date.now()-start>(back?55000:35000)||(!back&&bot.health<hp0))throw Error('LIFE_TIME')}
function threat(q){return Object.values(bot.entities).find(e=>{if(!['zombie','zombie_villager','skeleton','creeper','spider','witch'].includes(e.name)||e.position.distanceTo(q)>9)return false;const a=e.position.offset(0,(e.height||1.8)*.85,0),d=q.offset(0,1,0).minus(a);return !bot.world.raycast(a,d.unit(),Math.max(.01,d.norm()-.2))})}
async function move(q,back=false){check(back);if(!air(q)||!air(q.offset(0,1,0))||!full(q.offset(0,-1,0))||!full(q.offset(0,2,0)))throw Error('ENVELOPE_'+q);if(threat(q.offset(.5,0,.5)))throw Error('THREAT');if(Object.values(bot.entities).some(e=>e.username&&e!==self&&e.position.distanceTo(q.offset(.5,0,.5))<.65))throw Error('PEER_BODY');for(let n=0;n<60;n++){check(back);const d=bot.entity.position.distanceTo(q.offset(.5,0,.5));if(d<.1&&bot.entity.onGround){bot.clearControlStates();return}await bot.lookAt(q.offset(.5,1.4,.5),true);bot.setControlState('forward',true);bot.setControlState('sneak',d<.4);await bot.waitForTicks(1)}throw Error('MOVE_BOUND')}
bot.clearControlStates();bot.pathfinder.setGoal(null);
try{for(const q of route){await move(q);walked.push(q)}
const names=['basalt','cobbled_deepslate'];
bot.clearControlStates();bot.pathfinder.setGoal(null);
const p=bot.entity.position.clone(),hp=bot.health,dim=bot.game.dimension,life=bot.entity;
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0);
const before=Object.fromEntries(names.map(n=>[n,count(n)]));let issue=null,peerObserved=null;const issues=[];
try{
 if(Date.now()>1792273080000)throw Error('OFFER_EXPIRED_2138');
 const peer=Object.values(bot.entities).find(e=>e.username==='p4');
 if(!peer||peer.position.distanceTo(p)>3||names.some(n=>before[n]<1))throw Error('CURRENT_PEER_OR_STOCK');
 peerObserved=peer.position.clone();
 for(const name of names){
  if(bot.entity!==life||bot.health<hp||bot.game.dimension!==dim)throw Error('LIFE_CHANGED');
  const current=Object.values(bot.entities).find(e=>e.username==='p4');
  if(!current||current.position.distanceTo(bot.entity.position)>3)throw Error('PEER_MOVED');
  const item=bot.inventory.items().find(i=>i.name===name);
  await bot.lookAt(current.position.offset(0,1,0),true);
  await bot.toss(item.type,null,1);issues.push({name,at:new Date().toISOString(),donorCount:count(name)});
 }
 await bot.waitForTicks(5);
}catch(e){issue=e.message}finally{bot.clearControlStates();bot.pathfinder.setGoal(null)}
gift={at:new Date().toISOString(),beneficiary:'p4',purpose:'two named ownclosing reserve for P1 current tool unit',peerObserved,before,after:Object.fromEntries(names.map(n=>[n,count(n)])),issues,issue,positionRetained:bot.entity.position.distanceTo(p)<.1,healthRetained:bot.health>=hp,dimensionRetained:bot.game.dimension===dim,pos:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState,goal:bot.pathfinder.goal,cursor:bot.inventory.selectedItem,window:bot.currentWindow?.type||null};

}catch(e){issueRoute=e.message}finally{bot.clearControlStates();try{for(const q of walked.slice().reverse())await move(q,true);await move(original.floored(),true)}catch(e){issueRoute=(issueRoute?issueRoute+';':'')+'RETURN_'+e.message}bot.clearControlStates();bot.pathfinder.setGoal(null)}
return{at:new Date().toISOString(),elapsed:Date.now()-start,issueRoute,gift,walked:walked.map(q=>q.toArray()),retainedOriginal:bot.entity.position.distanceTo(original)<.15,pos:bot.entity.position,hp:bot.health,food:bot.food,controls:bot.controlState,goal:bot.pathfinder.goal,inventory:bot.inventory.items().map(i=>[i.name,i.count])};

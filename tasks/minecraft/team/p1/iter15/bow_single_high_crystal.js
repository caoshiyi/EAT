// ONE actual high-crystal arrow, complement to P4 snow. No movement or retry.
const arrowArc=function arrowArc(origin,target,blocked=()=>false){
const drag=.99,g=.05,speed=3,d=target.map((v,i)=>v-origin[i]),horizontal=Math.hypot(d[0],d[2]);
if(horizontal<18||horizontal>80)return{ok:false,why:'EXPLOSION_DISTANCE_OR_RANGE'};
function coeff(t){let n=Math.floor(t),f=t-n,p=drag**n,A=(1-p)/(1-drag);return[A+f*p,g/(1-drag)*(n-A)+f*g/(1-drag)*(1-p)]}
function velocity(t){const[A,B]=coeff(t);return[d[0]/A,(d[1]+B)/A,d[2]/A]}
let bracket=null,last=.2,prior=Math.hypot(...velocity(last))-speed;
for(let t=.4;t<=160;t+=.2){const now=Math.hypot(...velocity(t))-speed;if(prior>0&&now<=0){bracket=[last,t];break}last=t;prior=now}
if(!bracket)return{ok:false,why:'NO_LOW_ARC'};
let[lo,hi]=bracket;for(let k=0;k<40;k++){const mid=(lo+hi)/2;if(Math.hypot(...velocity(mid))>speed)lo=mid;else hi=mid}
const ticks=(lo+hi)/2,v=velocity(ticks),points=[origin.slice()];
for(let t=.5;t<ticks+.49;t+=.5){const[A,B]=coeff(Math.min(t,ticks)),p=origin.map((x,i)=>x+A*v[i]-(i===1?B:0)),from=points.at(-1);if(blocked(from,p))return{ok:false,why:'ARC_BLOCKED',from,p};points.push(p);if(t>=ticks)break}
const end=points.at(-1);return{ok:true,ticks,v,yaw:Math.atan2(-v[0],-v[2]),pitch:Math.atan2(v[1],Math.hypot(v[0],v[2])),end,points};
};

const {Vec3}=require('vec3'),self=bot.entity,start=Date.now(),hp0=bot.health,origin=bot.entity.position.clone(),eye=origin.offset(0,1.52,0);
const count=()=>bot.inventory.items().filter(i=>i.name==='arrow').reduce((n,i)=>n+i.count,0),before=count(),bars=()=>bot.bossBars.map(b=>[b.entityUUID,b.health,String(b.title)]);
let issue=null,charging=false,released=false,lost=false,selected=null,gone=false,cancelIssue=null,spawn=[],explosions=[],flight=[];
const stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)},full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');stop();
function die(){lost=true;stop()}
function check(){
 if(lost||bot.entity!==self||bot.game.dimension!=='the_end'||bot.health<=0)throw Error('LIFE_CHANGED');
 if(Date.now()-start>12000||Date.now()>1792250255000)throw Error('TIME');
 if(bot.health<hp0)throw Error('DAMAGE_END');if(bot.entity.position.distanceTo(origin)>.2||!self.onGround)throw Error('BODY_CHANGED');
 const danger=Object.values(bot.entities).find(e=>['ender_dragon','area_effect_cloud','dragon_fireball'].includes(e.name)&&e.position.distanceTo(origin)<(e.name==='ender_dragon'?35:12));if(danger)throw Error('LOCAL_THREAT_'+danger.name);
}
function peerNearTarget(e){return Object.values(bot.entities).some(p=>p.username&&p.id!==self.id&&p.position.distanceTo(e.position)<14)}
function blocked(a,b,target){
 const p=new Vec3(...a),d=new Vec3(...b).minus(p);if(!bot.blockAt(p)||!bot.blockAt(new Vec3(...b)))return true;
 if(bot.world.raycast(p,d.unit(),d.norm()))return true;
 return Object.values(bot.entities).some(e=>{
  if(e.id===self.id||e.id===target.id||!(e.type==='mob'||e.username||e.name==='end_crystal'))return false;
  const w=(e.width||.6)/2+.3,h=(e.height||1.8)+.3,q=e.position;
  return Math.max(a[0],b[0])>=q.x-w&&Math.min(a[0],b[0])<=q.x+w&&Math.max(a[1],b[1])>=q.y-.3&&Math.min(a[1],b[1])<=q.y+h&&Math.max(a[2],b[2])>=q.z-w&&Math.min(a[2],b[2])<=q.z+w;
 });
}
const onSpawn=e=>{if(e.name==='arrow'&&e.position.distanceTo(eye)<4)spawn.push({id:e.id,p:e.position.clone(),v:e.velocity?.clone()})},onGone=e=>{if(e.id===selected?.e.id)gone=true},onExplosion=p=>{if(selected&&[p.x,p.y,p.z].every(Number.isFinite)&&new Vec3(p.x,p.y,p.z).distanceTo(selected.target)<4)explosions.push({x:p.x,y:p.y,z:p.z,radius:p.radius})};
for(const ev of ['death','respawn','end'])bot.on(ev,die);bot.on('entitySpawn',onSpawn);bot.on('entityGone',onGone);bot._client.on('explosion',onExplosion);
try{
 check();if(hp0<18||!before||!full(origin.floored().offset(0,-1,0))||self.height!==1.8||self.metadata?.[6]===5||bot.physics.playerHeight!==1.8||Math.hypot(self.velocity.x,self.velocity.z)>.03||Math.abs(self.velocity.y)>.09)throw Error('STANDING_FULL_FLOOR_REQUIRED');
 const bow=bot.inventory.items().find(i=>i.name==='bow'),cancel=bot.inventory.items().find(i=>/sword$/.test(i.name));if(!bow||!cancel)throw Error('BOW_AND_CANCEL_ITEM_REQUIRED');
 const candidates=Object.values(bot.entities).filter(e=>e.name==='end_crystal'&&e.position.y+1-eye.y>29&&!peerNearTarget(e)).map(e=>{
  const target=e.position.offset(0,1,0),arc=arrowArc(eye.toArray(),target.toArray(),(a,b)=>blocked(a,b,e));return arc.ok?{e,target,arc}:null;
 }).filter(Boolean).sort((a,b)=>a.arc.ticks-b.arc.ticks);
 selected=candidates[0];if(!selected)throw Error('NO_ACTUAL_HIGH_CLEAR_CRYSTAL');
 await bot.equip(bow,'hand');await bot.look(selected.arc.yaw,selected.arc.pitch,true);await bot.waitForTicks(2);check();
 if(!bot.entities[selected.e.id]||peerNearTarget(selected.e))throw Error('TARGET_CHANGED');
 bot.activateItem();charging=true;
 for(let n=0;n<20;n++){await bot.waitForTicks(1);check();if(!bot.entities[selected.e.id]||peerNearTarget(selected.e))throw Error('TARGET_CHANGED_DURING_DRAW')}
 for(let n=1;n<selected.arc.points.length;n++)if(blocked(selected.arc.points[n-1],selected.arc.points[n],selected.e))throw Error('ARC_CHANGED_DURING_DRAW');
 bot.deactivateItem();charging=false;released=true;
 for(let n=0;n<Math.ceil(selected.arc.ticks)+16;n++){
  await bot.waitForTicks(1);check();
  if(n<12)for(const a of spawn){const e=bot.entities[a.id];if(e)flight.push([n,e.position.toArray(),e.velocity?.toArray()])}
  if(gone&&explosions.length)break;
 }
 if(count()!==before-1)throw Error('ARROW_DELTA_UNCONFIRMED');if(!spawn.length)throw Error('ARROW_SPAWN_UNCONFIRMED');if(!gone||!explosions.length)throw Error('CRYSTAL_EFFECT_UNCONFIRMED');
}catch(e){issue=e.message}
finally{
 // A bow release fires. Cancel an interrupted draw by switching item FIRST.
 if(charging&&!lost&&bot.entity===self&&bot.game.dimension==='the_end'&&bot.health>0)try{await bot.equip(bot.inventory.items().find(i=>/sword$/.test(i.name)),'hand');charging=false;bot.deactivateItem()}catch(e){cancelIssue=e.message}
 stop();for(const ev of ['death','respawn','end'])bot.removeListener(ev,die);bot.removeListener('entitySpawn',onSpawn);bot.removeListener('entityGone',onGone);bot._client.removeListener('explosion',onExplosion);
}
return {issue,cancelIssue,charging,released,lost,before,after:count(),spawn,flight,gone,explosions,target:selected?{id:selected.e.id,p:selected.target,expectedVelocity:selected.arc.v,ticks:selected.arc.ticks,pitch:selected.arc.pitch}:null,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,world:bot.game.dimension,bossBars:bars(),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),attribution:'ammo/spawn/Gone/explosion are separate observations; other shots can contribute'};

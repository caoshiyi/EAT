bot.clearControlStates();bot.pathfinder.setGoal(null);
if(bot.game.dimension!=='the_end')return{issue:'ACTUAL_END_REQUIRED_NO_ACTION'};
const snowArc=function snowArc(origin,target,blocked=()=>false){
const drag=.99,g=.03,speed=1.5,d=target.map((v,i)=>v-origin[i]),horizontal=Math.hypot(d[0],d[2]);
if(horizontal<18||horizontal>48)return{ok:false,why:'EXPLOSION_DISTANCE_OR_RANGE'};
function coeff(t){let n=Math.floor(t),f=t-n,p=drag**n,A=(1-p)/(1-drag);return[A+f*p,g/(1-drag)*(n-A)+f*g/(1-drag)*(1-p)]}
function velocity(t){const[A,B]=coeff(t);return[d[0]/A,(d[1]+B)/A,d[2]/A]}
let bracket=null,last=.2,prior=Math.hypot(...velocity(last))-speed;
for(let t=.4;t<=100;t+=.2){const now=Math.hypot(...velocity(t))-speed;if(prior>0&&now<=0){bracket=[last,t];break}last=t;prior=now}
if(!bracket)return{ok:false,why:'NO_LOW_ARC'};
let[lo,hi]=bracket;for(let k=0;k<40;k++){const mid=(lo+hi)/2;if(Math.hypot(...velocity(mid))>speed)lo=mid;else hi=mid}
const ticks=(lo+hi)/2,v=velocity(ticks),points=[origin.slice()];
for(let t=.5;t<ticks+.49;t+=.5){const[A,B]=coeff(Math.min(t,ticks)),p=origin.map((x,i)=>x+A*v[i]-(i===1?B:0)),from=points.at(-1);if(blocked(from,p))return{ok:false,why:'ARC_BLOCKED',from,p};points.push(p);if(t>=ticks)break}
const end=points.at(-1);return{ok:true,ticks,v,yaw:Math.atan2(-v[0],-v[2]),pitch:Math.atan2(v[1],Math.hypot(v[0],v[2])),end,points};
};
const{Vec3}=require('vec3'),self=bot.entity,began=Date.now(),hp=bot.health,start=bot.entity.position.clone(),eye=start.offset(0,1.62-.1,0),count=()=>bot.inventory.items().filter(i=>i.name==='snowball').reduce((s,i)=>s+i.count,0),before=count();let issue=null,spent=false,spawn=[],explosions=[],gone=false,selected=null,lost=false;
function stop(){bot.clearControlStates();bot.pathfinder.setGoal(null)}
function death(){lost=true;stop()}
function check(){if(lost||bot.entity!==self||bot.game.dimension!=='the_end'||bot.health<=0||Date.now()>1792242848000||Date.now()-began>9000)throw Error('LIFE_BOUND');if(bot.health<hp)throw Error('DAMAGE_END');if(bot.entity.position.distanceTo(start)>.3)throw Error('BODY_MOVED')}
const onSpawn=e=>{if(e.name==='snowball'&&e.position.distanceTo(eye)<4)spawn.push({id:e.id,p:e.position.clone(),v:e.velocity?.clone()})},onGone=e=>{if(selected&&e.id===selected.e.id)gone=true},onExplosion=p=>{if(selected&&[p.x,p.y,p.z].every(Number.isFinite)&&new Vec3(p.x,p.y,p.z).distanceTo(selected.e.position)<3)explosions.push({x:p.x,y:p.y,z:p.z,radius:p.radius})};
for(const e of['death','respawn','end'])bot.on(e,death);bot.on('entitySpawn',onSpawn);bot.on('entityGone',onGone);bot._client.on('explosion',onExplosion);
try{
check();if(!before||hp<18||!self.onGround||self.velocity.norm()>.03||self.metadata?.[6]!==0)throw Error('STATIONARY_STANDING_SHOT_REQUIRED');
const danger=Object.values(bot.entities).find(e=>['area_effect_cloud','dragon_fireball','ender_dragon'].includes(e.name)&&e.position.distanceTo(start)<(e.name==='ender_dragon'?35:12));if(danger)throw Error('LOCAL_THREAT_'+danger.name);
const candidates=Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>{
const peer=Object.values(bot.entities).find(p=>p.username&&p.id!==self.id&&p.position.distanceTo(e.position)<14);if(peer)return null;
const target=e.position.offset(0,1,0),arc=snowArc(eye.toArray(),target.toArray(),(a,b)=>{const from=new Vec3(...a),delta=new Vec3(...b).minus(from),hit=bot.world.raycast(from,delta.unit(),delta.norm());if(hit)return true;return Object.values(bot.entities).some(other=>{if(other.id===self.id||other.id===e.id||!(other.type==='mob'||other.username||other.name==='end_crystal'))return false;const w=(other.width||.6)/2+.25,h=(other.height||2)+.25,p=other.position;return Math.max(a[0],b[0])>=p.x-w&&Math.min(a[0],b[0])<=p.x+w&&Math.max(a[1],b[1])>=p.y-.25&&Math.min(a[1],b[1])<=p.y+h&&Math.max(a[2],b[2])>=p.z-w&&Math.min(a[2],b[2])<=p.z+w})});return arc.ok?{e,arc,target}:null}).filter(Boolean).sort((a,b)=>a.arc.ticks-b.arc.ticks);
selected=candidates[0];if(!selected)throw Error('NO_ACTUAL_CLEAR_CRYSTAL_ARC');
const item=bot.inventory.items().find(i=>i.name==='snowball');await bot.equip(item,'hand');await bot.look(selected.arc.yaw,selected.arc.pitch,true);await bot.waitForTicks(2);check();if(!bot.entities[selected.e.id])throw Error('TARGET_CHANGED');
bot.activateItem();await bot.waitForTicks(1);bot.deactivateItem();spent=count()<before;
for(let k=0;k<90;k++){check();if(count()===before-1)spent=true;if(gone&&explosions.length)break;await bot.waitForTicks(1)}
if(!spent||count()!==before-1)throw Error('AMMO_DELTA_UNCONFIRMED');if(!spawn.length)throw Error('PROJECTILE_SPAWN_UNCONFIRMED');if(!gone||!explosions.length)throw Error('TARGET_OUTCOME_UNCONFIRMED');
}catch(e){issue=e.message}finally{bot.deactivateItem();stop();for(const e of['death','respawn','end'])bot.removeListener(e,death);bot.removeListener('entitySpawn',onSpawn);bot.removeListener('entityGone',onGone);bot._client.removeListener('explosion',onExplosion)}
return{issue,spent,before,after:count(),spawn,explosions,gone,target:selected?{id:selected.e.id,p:selected.target,ticks:selected.arc.ticks,pitch:selected.arc.pitch}:null,hp:bot.health,food:bot.food,p:bot.entity.position.clone(),world:bot.game.dimension,lost,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),attribution:'targetGone+nearbyExplosion observed; other player shots may also contribute'};

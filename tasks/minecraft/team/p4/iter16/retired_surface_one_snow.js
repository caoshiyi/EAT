// Fresh plan -> one bounded surface peek -> immediate native enclosure return.
// ONE snowball maximum, then immediate native return. Actual End positive test pending.
bot.clearControlStates();bot.pathfinder.setGoal(null);
const plan=global.P4SurfacePlan;
if(bot.game.dimension!=='the_end'||!plan?.ok)return{issue:'FRESH_END_SURFACE_PLAN_REQUIRED_NO_ACTION'};
const{Vec3}=require('vec3'),V=a=>new Vec3(...a),self=bot.entity,origin=V(plan.origin),begin=Date.now(),hp=bot.health;
const names=['end_stone','cobbled_deepslate','basalt','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','blackstone','tuff','cobblestone'],dirs=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]],keys=['forward','back','left','right','jump','sprint','sneak'];
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0),full=q=>{const b=bot.blockAt(q);return names.includes(b?.name)&&b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')},native=q=>bot.blockAt(q)?.name==='end_stone'&&full(q),air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name),faces=q=>[q.offset(0,-1,0),q.offset(0,2,0),...dirs.flatMap(([x,y,z])=>[q.offset(x,0,z),q.offset(x,1,z)])],shell=q=>faces(q).every(native),stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)};
let issue=null,endingIssue=null,lost=false,recovery=false,mutated=false,reachedSurface=false,closed=false,trace=[],placed=new Map(),exit=null;
const discontinuity=()=>{lost=true;stop();bot.stopDigging()};for(const k of['death','respawn','end'])bot.on(k,discontinuity);
const localThreat=()=>Object.values(bot.entities).find(e=>['ender_dragon','enderman','area_effect_cloud','dragon_fireball'].includes(e.name)&&e.position.distanceTo(self.position)<(e.name==='ender_dragon'?35:e.name==='enderman'?4:12));
function check(){if(lost||bot.entity!==self||bot.game.dimension!=='the_end'||bot.health<=0)throw Error('DISCONTINUITY');if(Date.now()>1792257629000||Date.now()-begin>(recovery?50000:25000))throw Error('TIME');if(!recovery&&(bot.health<hp||localThreat()))throw Error('DAMAGE_OR_LOCAL_THREAT')}
async function ticks(n=1){check();await bot.waitForTicks(n);check()}
function centered(q){const p=self.position;return Math.hypot(p.x-q.x-.5,p.z-q.z-.5)<.12&&Math.abs(p.y-q.y)<.12&&self.onGround}
function occupied(q){return Object.values(bot.entities).some(e=>e.username&&e.id!==self.id&&e.position.x+.3>q.x&&e.position.x-.3<q.x+1&&e.position.z+.3>q.z&&e.position.z-.3<q.z+1&&e.position.y+(e.height||1.8)>q.y&&e.position.y<q.y+1)}
async function put(q,onlyNative=false){if(full(q))return;if(!air(q)||occupied(q))throw Error('PLACE_KIND_OR_PEER');const item=bot.inventory.items().find(i=>i.name==='end_stone')||(!onlyNative?bot.inventory.items().find(i=>names.includes(i.name)):null);if(!item)throw Error('CAP_STOCK');const d=[[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]].map(V).find(d=>full(q.plus(d)));if(!d)throw Error('CAP_REFERENCE');const name=item.name,before=count(name);await bot.equip(item,'hand');bot.setControlState('sneak',true);placed.set(q.toArray().join(','),name);trace.push(['CAP_INTENT',q.toArray(),name]);await bot._placeBlockWithOptions(bot.blockAt(q.plus(d)),d.scaled(-1),{forceLook:true});await ticks(3);if(bot.blockAt(q)?.name!==name||count(name)!==before-1)throw Error('CAP_ACK');placed.set(q.toArray().join(','),name);trace.push(['CAP',q.toArray(),name])}
async function cut(q,allowed){if(air(q))return;const b=bot.blockAt(q),name=b?.name;if(!full(q)||!allowed.includes(name))throw Error('CUT_KIND');const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<129);if(!pick)throw Error('PICK_RESERVE');const before=count(name==='deepslate'?'cobbled_deepslate':name);await bot.equip(pick,'hand');await bot.dig(b,true);await ticks(3);if(!air(q))throw Error('CUT_ACK');const dropped=name==='deepslate'?'cobbled_deepslate':name;for(let n=0;n<25&&count(dropped)<=before;n++)await ticks();if(count(dropped)!==before+1)throw Error('ORDINARY_DROP');trace.push(['CUT',q.toArray(),name])}
async function stand(){stop();for(let n=0;n<15&&(self.height!==1.8||self.metadata?.[6]===5);n++)await ticks();if(self.height!==1.8||bot.physics.playerHeight!==1.8||self.metadata?.[6]===5)throw Error('ACTUAL_STANDING')}
async function up(){const q=self.position.floored();if(!centered(q)||!full(q.offset(0,-1,0))||!air(q)||!air(q.offset(0,1,0)))throw Error('UP_BODY');await stand();const roof=q.offset(0,2,0);mutated=true;if(!air(roof))await cut(roof,['end_stone']);bot.setControlState('jump',true);for(let n=0;n<15&&self.position.y<q.y+1.05;n++)await ticks();if(self.position.y<q.y+1.05)throw Error('JUMP_BOUND');await put(q);stop();await ticks(8);if(!centered(q.offset(0,1,0)))throw Error('UP_ACK');trace.push(['UP',self.position.clone(),bot.health])}
async function move(q){const p=self.position.floored();if(p.y!==q.y||Math.abs(p.x-q.x)+Math.abs(p.z-q.z)>1||!full(q.offset(0,-1,0))||!air(q)||!air(q.offset(0,1,0))||occupied(q))throw Error('MOVE_GEOMETRY');for(let n=0,stable=0;n<65;n++){check();stop();if(centered(q)){if(++stable>=2)return}else stable=0;const d=Math.hypot(self.position.x-q.x-.5,self.position.z-q.z-.5);if(Math.abs(self.position.y-q.y)>.2)throw Error('MOVE_Y');if(d>.05){await bot.lookAt(new Vec3(q.x+.5,self.position.y+1,q.z+.5),true);bot.setControlState('sneak',true);bot.setControlState('forward',true)}await ticks()}throw Error('MOVE_BOUND')}
async function recover(){recovery=true;stop();for(let n=0;n<15&&!self.onGround;n++)await ticks();const top=new Vec3(origin.x,plan.top+1,origin.z);
 if(self.position.floored().x!==origin.x||self.position.floored().z!==origin.z){if(Math.abs(self.position.y-top.y)>.12||Math.abs(self.position.x-top.x-.5)+Math.abs(self.position.z-top.z-.5)>1.2)throw Error('RETURN_OFF_ROUTE');await put(top.offset(0,-1,0));await move(top)}
 for(let n=0;n<plan.rise+1&&self.position.y>origin.y+.12;n++){const p=self.position.floored();if(!centered(p)||p.y>plan.top+1||p.y<origin.y+1)throw Error('RETURN_BODY');const floor=p.offset(0,-1,0),name=placed.get(floor.toArray().join(','));if(!name||bot.blockAt(floor)?.name!==name)throw Error('RETURN_FLOOR_CHANGED');await cut(floor,[name]);stop();await ticks(10);if(!centered(p.offset(0,-1,0)))throw Error('DOWN_ACK')}
 if(!centered(origin))throw Error('RETURN_ORIGIN');if(air(origin.offset(0,2,0)))for(let n=0;n<25&&!count('end_stone');n++)await ticks();await put(origin.offset(0,2,0),true);stop();await ticks(4);closed=shell(origin);if(!closed)throw Error('NATIVE_ENDING');trace.push(['NATIVE_RETURN',self.position.clone(),bot.health])}
try{
 check();if(Date.now()-plan.at>30000||plan.entityId!==self.id||!centered(origin)||hp<18||!shell(origin)||plan.rise<3||plan.rise>5||Date.now()+50000>1792257629000)throw Error('FRESH_NATIVE_PLAN');
 const stock=bot.inventory.items().filter(i=>names.includes(i.name)).reduce((s,i)=>s+i.count,0),pickUses=Math.max(0,...bot.inventory.items().filter(i=>i.name==='stone_pickaxe').map(i=>131-i.durabilityUsed));if(stock<plan.extraFloors+3||pickUses<plan.toolPrice)throw Error('WHOLE_PRICE_CHANGED');
 exit=plan.exits.map(V).find(q=>native(q.offset(0,-1,0))&&[0,1,2].every(y=>air(q.offset(0,y,0)))&&!occupied(q));if(!exit)throw Error('EXIT_CHANGED');
 // No edits until current entire center column and surface headroom are rechecked.
 for(let y=origin.y+2;y<=plan.top;y++)if(!native(new Vec3(origin.x,y,origin.z)))throw Error('COLUMN_CHANGED');for(let y=plan.top+1;y<=plan.top+3;y++)if(!air(new Vec3(origin.x,y,origin.z)))throw Error('TOP_CHANGED');
 for(let n=0;n<plan.rise;n++)await up();await move(exit);reachedSurface=true;trace.push(['ACTUAL_SURFACE_PEEK',self.position.clone(),bot.health,Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>[e.id,e.position.clone()])]);
 await stand();stop();await ticks(4);
 const shootOne=async()=>{
bot.clearControlStates();bot.pathfinder.setGoal(null);
if(bot.game.dimension!=='the_end')return{issue:'ACTUAL_END_REQUIRED_NO_ACTION'};
// Exact normal-dry 1.20.4 central launch model. Random spread is not eliminated.
const snowArc=function snowArc(origin,target,blocked=()=>false,branch='low'){
 const drag=.99,g=.03,speed=1.5,d=target.map((v,i)=>v-origin[i]),horizontal=Math.hypot(d[0],d[2]);
 if(horizontal<18||horizontal>48)return{ok:false,why:'EXPLOSION_DISTANCE_OR_RANGE'};
 function coeff(t){const n=Math.floor(t),f=t-n,p=drag**n,A=(1-p)/(1-drag);return[A+f*p,g/(1-drag)*(n-A)+f*g/(1-drag)*(1-p)]}
 function velocity(t){const[A,B]=coeff(t);return[d[0]/A,(d[1]+B)/A,d[2]/A]}
 let bracket=null,last=.2,prior=Math.hypot(...velocity(last))-speed;
 for(let t=.4;t<=100;t+=.2){const now=Math.hypot(...velocity(t))-speed;if((branch==='low'&&prior>0&&now<=0)||(branch==='high'&&prior<=0&&now>0)){bracket=[last,t];break}last=t;prior=now}
 if(!bracket)return{ok:false,why:'NO_'+branch.toUpperCase()+'_ARC'};
 let[lo,hi]=bracket;for(let k=0;k<40;k++){const mid=(lo+hi)/2,above=Math.hypot(...velocity(mid))>speed;if((branch==='low'&&above)||(branch==='high'&&!above))lo=mid;else hi=mid}
 const ticks=(lo+hi)/2;if(ticks>85)return{ok:false,why:'FLIGHT_EXCEEDS_RECEIPT_WINDOW'};const v=velocity(ticks),points=[origin.slice()];
 for(let t=.5;t<ticks+.49;t+=.5){const[A,B]=coeff(Math.min(t,ticks)),p=origin.map((x,i)=>x+A*v[i]-(i===1?B:0)),from=points.at(-1);if(blocked(from,p))return{ok:false,why:'ARC_BLOCKED',from,p,branch};points.push(p);if(t>=ticks)break}
 return{ok:true,branch,ticks,v,yaw:Math.atan2(-v[0],-v[2]),pitch:Math.atan2(v[1],Math.hypot(v[0],v[2])),end:points.at(-1),points};
};

const{Vec3}=require('vec3'),self=bot.entity,began=Date.now(),hp=bot.health,start=bot.entity.position.clone(),eye=start.offset(0,1.62-.1,0),count=()=>bot.inventory.items().filter(i=>i.name==='snowball').reduce((s,i)=>s+i.count,0),before=count();let issue=null,spent=false,spawn=[],explosions=[],gone=false,selected=null,lost=false;
function stop(){bot.clearControlStates();bot.pathfinder.setGoal(null)}
function death(){lost=true;stop()}
function check(){if(lost||bot.entity!==self||bot.game.dimension!=='the_end'||bot.health<=0||Date.now()>1792257629000||Date.now()-began>9000)throw Error('LIFE_BOUND');if(bot.health<hp)throw Error('DAMAGE_END');if(bot.entity.position.distanceTo(start)>.3)throw Error('BODY_MOVED');const approaching=Object.values(bot.entities).find(e=>['area_effect_cloud','dragon_fireball','ender_dragon'].includes(e.name)&&e.position.distanceTo(start)<(e.name==='ender_dragon'?35:12));if(approaching)throw Error('LOCAL_THREAT_'+approaching.name)}
const onSpawn=e=>{if(e.name==='snowball'&&e.position.distanceTo(eye)<4)spawn.push({id:e.id,p:e.position.clone(),v:e.velocity?.clone()})},onGone=e=>{if(selected&&e.id===selected.e.id)gone=true},onExplosion=p=>{if(selected&&[p.x,p.y,p.z].every(Number.isFinite)&&new Vec3(p.x,p.y,p.z).distanceTo(selected.e.position)<3)explosions.push({x:p.x,y:p.y,z:p.z,radius:p.radius})};
for(const e of['death','respawn','end'])bot.on(e,death);bot.on('entitySpawn',onSpawn);bot.on('entityGone',onGone);bot._client.on('explosion',onExplosion);
try{
check();if(!before||hp<18||!self.onGround||Math.hypot(self.velocity.x,self.velocity.z)>.03||Math.abs(self.velocity.y)>.09||self.height!==1.8||bot.physics.playerHeight!==1.8||self.metadata?.[6]===5)throw Error('STATIONARY_STANDING_SHOT_REQUIRED');
const danger=Object.values(bot.entities).find(e=>['area_effect_cloud','dragon_fireball','ender_dragon'].includes(e.name)&&e.position.distanceTo(start)<(e.name==='ender_dragon'?35:12));if(danger)throw Error('LOCAL_THREAT_'+danger.name);
const candidates=Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>{
const peer=Object.values(bot.entities).find(p=>p.username&&p.id!==self.id&&p.position.distanceTo(e.position)<14);if(peer)return null;
const choices=[];for(const off of[[0,1,0],[.55,1,.55],[.55,1,-.55],[-.55,1,.55],[-.55,1,-.55]]){const target=e.position.offset(...off);for(const branch of['low','high']){const arc=snowArc(eye.toArray(),target.toArray(),(a,b)=>{const from=new Vec3(...a),delta=new Vec3(...b).minus(from),hit=bot.world.raycast(from,delta.unit(),delta.norm());if(hit)return true;return Object.values(bot.entities).some(other=>{if(other.id===self.id||other.id===e.id||!(other.type==='mob'||other.username||other.name==='end_crystal'))return false;const w=(other.width||.6)/2+.25,h=(other.height||2)+.25,p=other.position;return Math.max(a[0],b[0])>=p.x-w&&Math.min(a[0],b[0])<=p.x+w&&Math.max(a[1],b[1])>=p.y-.25&&Math.min(a[1],b[1])<=p.y+h&&Math.max(a[2],b[2])>=p.z-w&&Math.min(a[2],b[2])<=p.z+w})},branch);if(arc.ok)choices.push({e,arc,target})}}return choices.sort((a,b)=>a.arc.ticks-b.arc.ticks)[0]||null}).filter(Boolean).sort((a,b)=>a.arc.ticks-b.arc.ticks);
selected=candidates[0];if(!selected)throw Error('NO_ACTUAL_CLEAR_CRYSTAL_ARC');
const item=bot.inventory.items().find(i=>i.name==='snowball');await bot.equip(item,'hand');await bot.look(selected.arc.yaw,selected.arc.pitch,true);await bot.waitForTicks(2);check();if(!bot.entities[selected.e.id])throw Error('TARGET_CHANGED');
bot.activateItem();await bot.waitForTicks(1);bot.deactivateItem();spent=count()<before;
for(let k=0;k<90;k++){check();if(count()===before-1)spent=true;if(gone&&explosions.length)break;await bot.waitForTicks(1)}
if(!spent||count()!==before-1)throw Error('AMMO_DELTA_UNCONFIRMED');if(!spawn.length)throw Error('PROJECTILE_SPAWN_UNCONFIRMED');if(!gone||!explosions.length)throw Error('TARGET_OUTCOME_UNCONFIRMED');
}catch(e){issue=e.message}finally{bot.deactivateItem();stop();for(const e of['death','respawn','end'])bot.removeListener(e,death);bot.removeListener('entitySpawn',onSpawn);bot.removeListener('entityGone',onGone);bot._client.removeListener('explosion',onExplosion)}
return{issue,spent,before,after:count(),spawn,explosions,gone,target:selected?{id:selected.e.id,p:selected.target,ticks:selected.arc.ticks,pitch:selected.arc.pitch,branch:selected.arc.branch,expectedVelocity:selected.arc.v,spreadModel:'exact1.20.4 per-axis triangle(0,.0172275)*1.5 before shooter-motion'}:null,hp:bot.health,food:bot.food,p:bot.entity.position.clone(),world:bot.game.dimension,lost,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),attribution:'targetGone+nearbyExplosion observed; other player shots may also contribute'};

 };
 const shotReceipt=await shootOne();trace.push(['SHOT_RECEIPT',shotReceipt]);if(shotReceipt.issue)throw Error('SHOT:'+shotReceipt.issue);
 await recover();
}catch(e){issue=e.message;stop();if(!lost&&mutated)try{await recover()}catch(r){endingIssue=r.message;trace.push(['DANGEROUS_ENDING',endingIssue,self.position.clone(),bot.health])}}
finally{stop();for(const k of['death','respawn','end'])bot.removeListener(k,discontinuity)}
return{issue,endingIssue,reachedSurface,closed,lost,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,trace,own:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),controls:Object.fromEntries(keys.map(k=>[k,bot.getControlState(k)]))};

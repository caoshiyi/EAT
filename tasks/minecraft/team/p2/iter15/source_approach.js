// Source-only primitives; explicit bounded caller required. No process/network/files.
const {Vec3}=require('vec3'),V=a=>new Vec3(...a),start=Date.now(),self=bot.entity,dim=bot.game.dimension,hp0=bot.health;
const BACK=V([-133,61,-431]),W=V([-133,61,-430]),LOW=V([-132,61,-430]),G=LOW.offset(0,1,0);
const capNames=['netherrack','basalt','blackstone','nether_bricks','cobblestone','dirt','sandstone','spruce_planks'];
let recovery=false,lost=false,issue=null,endingIssue=null,trace=[],hurts=[],projectiles=[],forced=0;
const stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.deactivateItem()},B=q=>bot.blockAt(q),name=q=>B(q)?.name;
const full=q=>{const b=B(q);return b&&!/lava|water|fire|magma/.test(b.name)&&b.shapes.some(s=>s.join(',')==='0,0,0,1,1,1')},air=q=>['air','cave_air','void_air','torch','wall_torch'].includes(name(q));
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0),stock=()=>bot.inventory.items().filter(i=>capNames.includes(i.name)).reduce((s,i)=>s+i.count,0);
const faces=q=>[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(a=>q.offset(...a));
const pod=q=>faces(q).every(full)&&bot.entity.position.floored().equals(q)&&bot.entity.onGround;
function live(){if(lost||bot.entity!==self||bot.game.dimension!==dim||bot.health<=0)throw Error('LIFE_DISCONTINUITY');if(dim!=='the_nether')throw Error('SOURCE_DIM');if(Date.now()>1792250260000||Date.now()-start>(recovery?110000:75000))throw Error('SOURCE_TIME');if(!recovery&&(hurts.length||bot.health<hp0))throw Error('HURT_RECOVER');}
async function t(n=1){live();await bot.waitForTicks(n);live()}
const onLife=()=>{lost=true;stop()},onHurt=e=>{if(e===self){hurts.push([Date.now(),bot.health,bot.entity.position.clone()]);stop()}},onForced=()=>forced++;
bot.on('death',onLife);bot.on('respawn',onLife);bot.on('entityHurt',onHurt);bot.on('forcedMove',onForced);stop();
function cleanup(){stop();bot.removeListener('death',onLife);bot.removeListener('respawn',onLife);bot.removeListener('entityHurt',onHurt);bot.removeListener('forcedMove',onForced)}
function ray(a,b){const d=b.minus(a),n=d.norm();if(n<1e-6)return null;return bot.world.raycast(a,d.scaled(1/n),n,(bl,it)=>it.intersect(bl.shapes,bl.position))}
async function cut(q){live();if(air(q))return;const b=B(q),k=b?.name;if(!capNames.includes(k)&&!['cobblestone_slab','blackstone_slab','crafting_table'].includes(k))throw Error('CUT_KIND_'+k);for(const d of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){let b2=B(q.offset(...d));if(!b2||/lava|water|fire/.test(b2.name)||d[1]===1&&['sand','gravel'].includes(b2.name))throw Error('CUT_OUTER_UNKNOWN_HOT');}
 if(k==='dirt'||k==='spruce_planks'||k==='crafting_table')await bot.unequip('hand');else{const pick=bot.inventory.items().find(i=>i.name==='wooden_pickaxe'&&i.durabilityUsed<55)||bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed<125);if(!pick)throw Error('PICK_RESERVE');await bot.equip(pick,'hand');await t(3);if(!/_pickaxe$/.test(bot.heldItem?.name||''))throw Error('HELD_PICK_ACK');}
 await bot.dig(b,true);await t(5);if(!air(q))throw Error('CUT_ACK');trace.push(['CUT',q.toArray(),k]);}
async function put(q,exact=null){live();if(full(q))return;if(!air(q))throw Error('CAP_NONAIR_'+name(q));const it=exact?bot.inventory.items().find(i=>i.name===exact):capNames.map(n=>bot.inventory.items().find(i=>i.name===n)).find(Boolean);if(!it)throw Error('CAP_STOCK');const use=it.name;let error;for(const d of[[0,-1,0],[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){const ref=q.offset(...d);if(!full(ref))continue;try{await bot.equip(it,'hand');bot.setControlState('sneak',true);await bot._placeBlockWithOptions(B(ref),V(d.map(a=>-a)),{forceLook:true});await t(4);if(!full(q))throw Error('CAP_ACK');trace.push(['CAP',q.toArray(),name(q),use]);return;}catch(e){error=e;if(full(q)){trace.push(['CAP_ACK_AFTER_EXCEPTION',q.toArray(),name(q),e.message]);return;}if(!bot.inventory.items().some(i=>i.name===use))break;}finally{bot.clearControlStates();}}throw error||Error('CAP_NO_REF');}
async function move(q,x=q.x+.5){live();if(!full(q.offset(0,-1,0))||!air(q)||!air(q.offset(0,1,0)))throw Error('MOVE_NATIVE_'+q);for(let k=0,stable=0;k<70;k++){live();stop();const p=bot.entity.position,d=Math.hypot(p.x-x,p.z-q.z-.5);if(bot.entity.onGround&&Math.abs(p.y-q.y)<.08&&d<.085){if(++stable>=3)return;}else stable=0;if(d>.045){await bot.lookAt(new Vec3(x,p.y+1.4,q.z+.5),true);bot.setControlState('forward',true);bot.setControlState('sneak',d<.55);}bot.setControlState('jump',q.y>p.y+.15);await t();}throw Error('MOVE_BOUND_'+q);}
async function backEnd(){recovery=true;stop();live();if(![BACK,W].some(q=>bot.entity.position.floored().equals(q)))throw Error('ENDING_BODY');await move(BACK);await put(W.offset(0,1,0));await put(W);await t(12);if(!pod(BACK))throw Error('BACK_END_NOT_FULL');trace.push(['BACK_END_PROVED',bot.health,count('blaze_rod'),stock()]);}
function gateClosed(){let b=B(G);return b?.name==='spruce_fence_gate'&&!b.getProperties().open&&['east','west'].includes(b.getProperties().facing)&&b.shapes.some(s=>s.join(',')==='0.375,0,0,0.625,1.5,1');}
function sourceSnapshot(){const cols=[];for(let x=-135;x<=-130;x++)for(let z=-431;z<=-429;z++){const col=[];for(let y=56;y<=65;y++){const b=B(V([x,y,z]));col.push([y,b?.name,b?.getProperties()]);}cols.push([x,z,col]);}return cols;}
function snap(){return{at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,flags:self.metadata?.[0],onFire:!!(self.metadata?.[0]&1),pose:self.metadata?.[6],height:self.height,physics:bot.physics.playerHeight,onGround:self.onGround,lost,forced,backFull:pod(BACK),wFull:pod(W),gateClosed:gateClosed(),cursor:bot.inventory.selectedItem,stock:stock(),rods:count('blaze_rod'),inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),blazes:Object.values(bot.entities).filter(e=>e.name==='blaze').map(e=>({id:e.id,p:e.position.clone(),hp:e.metadata?.[9],charge:e.metadata?.[16]})),drops:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(self.position)<12).map(e=>({id:e.id,p:e.position.clone(),item:e.getDroppedItem?.()?.name,count:e.getDroppedItem?.()?.count})),controls:Object.fromEntries(['forward','back','left','right','jump','sneak','sprint'].map(k=>[k,bot.getControlState(k)]))};}
let units=0,backOpened=false;
try{
 live();if(!bot.entity.position.floored().equals(V([-133,57,-430]))||!pod(V([-133,57,-430])))throw Error('W57_START');
 if(!full(V([-133,63,-430]))||!full(V([-132,60,-430]))||!full(LOW))throw Error('SOURCE_FLOOR_HOOD');
 for(let y=58;y<=62;y++)for(const [x,z]of[[-134,-430],[-133,-431],[-133,-429]])if(!full(V([x,y,z])))throw Error('SHAFT_NATIVE_OUTER_'+[x,y,z]);
 for(let y=58;y<=61;y++)if(!full(V([-132,y,-430])))throw Error('SHAFT_E_OUTER_'+y);
 if(!full(G)&&!air(G)&&name(G)!=='fire')throw Error('LOW_HEAD_KIND_'+name(G));
 for(let y=57;y<61;y++){
  let q=V([-133,y,-430]);if(y===60){if(name(G)==='fire'){await bot.unequip('hand');await bot.dig(B(G),true);await t(2);if(!air(G))throw Error('FIRE_EXTINGUISH_ACK');trace.push(['FIRE_EXTINGUISHED',bot.health]);}await put(G);if(!full(G))throw Error('LOW_HEAD_NOT_CAPPED');trace.push(['LOW_HEAD_CAPPED_BEFORE_LAST_RISE',bot.health]);}
  await cut(q.offset(0,2,0));const it=capNames.map(n=>bot.inventory.items().find(i=>i.name===n)).find(Boolean);if(!it||!full(q.offset(0,-1,0)))throw Error('PILLAR_INPUT');
  await bot.equip(it,'hand');bot.setControlState('jump',true);try{for(let k=0;k<22&&self.position.y<y+1.04;k++)await t();if(self.position.y<y+1.04)throw Error('JUMP_ACK');await bot._placeBlockWithOptions(B(q.offset(0,-1,0)),V([0,1,0]),{forceLook:'ignore'});}finally{bot.clearControlStates();}
  for(let k=0;k<30&&(!self.onGround||Math.abs(self.position.y-y-1)>.08);k++)await t();if(!self.onGround||Math.abs(self.position.y-y-1)>.08)throw Error('RISE_ACK');units++;trace.push(['RISE',y+1,stock(),bot.health]);
 }
 if(!pod(W))throw Error('W_LOW_NOT_FULL');trace.push(['W_LOW_FULL',bot.health,count('iron_sword'),stock()]);
 for(const q of faces(BACK)){if(q.equals(W)||q.equals(W.offset(0,1,0)))continue;if(!full(q))throw Error('BACK_POD_NATIVE_OUTER_'+q);}
 if(![BACK,BACK.offset(0,1,0)].every(q=>air(q)||full(q)))throw Error('BACK_POD_KIND');
 backOpened=true;await cut(BACK.offset(0,1,0));await cut(BACK);await move(BACK);await t(12);if(stock()<2)throw Error('BACK_END_ORDINARY_CAPS');
 await backEnd();
}catch(e){issue=e.message;trace.push(['ISSUE',issue,self.position.clone(),bot.health]);}
finally{
 recovery=true;stop();if(!lost)try{if(backOpened&&[W,BACK].some(q=>self.position.floored().equals(q)))await backEnd();else{const q=self.position.floored();if(q.x!==-133||q.z!==-430||q.y<57||q.y>61)throw Error('RECOVERY_BODY');for(const p of faces(q))if(!full(p))await put(p);if(!pod(q))throw Error('APPROACH_END_NOT_FULL');}}catch(e){endingIssue=e.message;trace.push(['END_FAILED',endingIssue,self.position.clone(),bot.health]);}cleanup();
}
return{issue,endingIssue,units,backOpened,trace,...snap(),cols:sourceSnapshot()};

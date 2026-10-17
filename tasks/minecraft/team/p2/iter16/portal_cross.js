// Pure world read: bounded two-high horizontal AIR tube with prospective next cut.
// Inline into owner caller. Does not mine, place, move, equip, or control a player.
function p3ClosedTube(bot,here,next,maxCells=12,native=null){
 const key=q=>[q.x,q.y,q.z].join(','),air=q=>['air','cave_air','void_air','torch','wall_torch'].includes(bot.blockAt(q)?.name);
 const full=native||(q=>{const b=bot.blockAt(q);return b&&!/lava|water|fire|magma|gravel|^sand$/.test(b.name)&&b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')});
 if(next.y!==here.y)return{ok:false,issue:'VERTICAL_KEEP_ORIGINAL_GUARD',cells:[]};
 if(Math.abs(next.x-here.x)+Math.abs(next.z-here.z)>1)return{ok:false,issue:'NEXT_NOT_ADJACENT',cells:[]};
 const virtual=new Set([key(next),key(next.offset(0,1,0))]);
 for(const q of[here,here.offset(0,1,0)])if(!air(q))return{ok:false,issue:'BODY_NOT_AIR',cells:[]};
 for(const q of[next,next.offset(0,1,0)])if(!air(q)&&!full(q))return{ok:false,issue:'NEXT_UNSAFE_KIND',cells:[]};
 const clear=q=>virtual.has(key(q))||air(q),queue=[here],seen=new Set([key(here)]),fail=issue=>({ok:false,issue,cells:queue});
 for(let i=0;i<queue.length;i++){
  const q=queue[i];if(!full(q.offset(0,-1,0))||!full(q.offset(0,2,0)))return fail('FLOOR_ROOF_OPEN_'+q.toArray().join(',')+'_below_'+bot.blockAt(q.offset(0,-1,0))?.name+'_above_'+bot.blockAt(q.offset(0,2,0))?.name);
  for(const[x,z]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const n=q.offset(x,0,z);if(seen.has(key(n)))continue;
   const a=n,b=n.offset(0,1,0);
   if(full(a)&&full(b)&&!virtual.has(key(a)))continue;
   if(!clear(a)||!clear(b))return fail('PARTIAL_OR_UNSAFE_SIDE_'+n.toArray().join(','));
   if(queue.length>=maxCells)return fail('TUBE_LIMIT');
   seen.add(key(n));queue.push(n);
  }
 }
 const hostile=new Set(['blaze','ghast','skeleton','wither_skeleton','piglin','hoglin','zoglin','magma_cube','zombie','creeper','spider','enderman','silverfish','cave_spider','stray','drowned','witch']);
 for(const e of Object.values(bot.entities||{}))if(hostile.has(e.name)&&(e.metadata?.[9]??1)>0&&queue.some(q=>e.position.x>=q.x-.3&&e.position.x<=q.x+1.3&&e.position.z>=q.z-.3&&e.position.z<=q.z+1.3&&e.position.y<q.y+2&&e.position.y+(e.height||1.8)>q.y))return fail('HOSTILE_INSIDE');
 return{ok:true,issue:null,cells:queue};
}



const {Vec3}=require('vec3'),V=(x,y,z)=>new Vec3(x,y,z),start=Date.now(),hp=bot.health,origin=bot.entity.position.clone();let issue=null,lost=false,ow=false,closed=false,recovering=false,cuts=0,respawnSeen=false;
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name),stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)},die=()=>{lost=true;stop()};
const respawn=()=>{respawnSeen=true;stop()};for(const n of['death','end'])bot.on(n,die);bot.on('respawn',respawn);stop();
function check(){if(lost||bot.health<=0||(!recovering&&bot.health<hp)||Date.now()-start>55000||Date.now()>1792257629000-5000)throw Error('LIFE_TIME');if(respawnSeen&&bot.game.dimension!=='overworld')throw Error('UNEXPECTED_RESPAWN');if(!['the_nether','overworld'].includes(bot.game.dimension))throw Error('UNEXPECTED_DIMENSION');}
async function tick(n=1){check();await bot.waitForTicks(n);check()}
function foe(){return Object.values(bot.entities).find(e=>['blaze','ghast','skeleton','wither_skeleton','piglin','hoglin','magma_cube','zombie','creeper','spider','enderman'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<24)}
async function move(q){for(let n=0;n<50;n++){check();if(bot.game.dimension==='overworld')return;if(foe())throw Error('LOCAL_FOE');const p=bot.entity.position,d=Math.hypot(p.x-q.x-.5,p.z-q.z-.5);if(d<.09&&bot.entity.onGround){stop();await tick(2);return;}if(!full(q.offset(0,-1,0)))throw Error('FLOOR');await bot.lookAt(q.offset(.5,1.4,.5),true);bot.setControlState('forward',true);bot.setControlState('sneak',d<.4);await tick();}throw Error('MOVE_BOUND')}
async function put(q){if(full(q))return;if(!air(q))throw Error('REPAIR_KIND');const item=bot.inventory.items().find(i=>i.name==='basalt');if(!item)throw Error('REPAIR_STOCK');await bot.equip(item,'hand');const ref=bot.blockAt(q.offset(-1,0,0));if(!full(ref.position))throw Error('REPAIR_REF');await bot.placeBlock(ref,V(1,0,0));await tick(2);if(!full(q))throw Error('REPAIR_ACK')}
try{
 if(bot.game.dimension!=='the_nether'||origin.distanceTo(V(18.5,8,274.5))>.2||!bot.entity.onGround||bot.inventory.items().filter(i=>i.name==='basalt').reduce((n,i)=>n+i.count,0)<2)throw Error('ACTUAL_START_CAPS');
 let portals=0;for(const x of[18,19])for(const y of[8,9,10])portals+=bot.blockAt(V(x,y,278))?.name==='nether_portal';if(portals!==6||foe())throw Error('PORTAL_FOE');
 for(const z of[274,275,276,277,278])if(!full(V(18,7,z)))throw Error('OBSERVED_FLOOR');
 if(!full(V(18,11,277)))throw Error('THREE_HIGH_ROOF');
 const doors=[V(18,9,275),V(18,8,275)];if(!doors.every(q=>bot.blockAt(q)?.name==='basalt'))throw Error('EXACT_DOOR_KIND');
 await bot.unequip('hand');await tick(4);const price=doors.reduce((n,q)=>n+bot.digTime(bot.blockAt(q)),0);if(bot.heldItem||Date.now()+price+18000>start+45000)throw Error('WHOLE_PRICE');
 for(const q of doors){if(foe())throw Error('LOCAL_FOE');await bot.dig(bot.blockAt(q),true);await tick(2);if(!air(q))throw Error('CUT_ACK');cuts++;}
 for(const z of[275,276,277,278]){await move(V(18,8,z));if(bot.game.dimension==='overworld')break;}
 stop();for(let n=0;n<200&&bot.game.dimension==='the_nether';n++)await tick();
 if(bot.game.dimension!=='overworld')throw Error('NO_OVERWORLD');await tick(4);ow=true;
 const p=bot.entity.position;if(Math.abs(p.y+26)>.15||![163,164].includes(Math.floor(p.x))||Math.abs(p.z-2230.5)>1.6)throw Error('UNEXPECTED_OW_ENDPOINT');
}catch(e){issue=e.message}finally{
 stop();recovering=true;
 if(!lost&&bot.game.dimension==='the_nether'&&bot.health>0)try{await move(V(18,8,274));await put(V(18,8,275));await put(V(18,9,275));const p=bot.entity.position.floored();closed=p3ClosedTube(bot,p,p,512).ok;}catch(e){console.log('RECOVERY_FAIL',e.message)}
 stop();for(const n of['death','end'])bot.removeListener(n,die);bot.removeListener('respawn',respawn);
}
return{issue,lost,respawnSeen,expectedOW:ow,needsOWInspection:bot.game.dimension==='overworld',closed,p:bot.entity.position,hp:bot.health,food:bot.food,dimension:bot.game.dimension,cuts,seconds:(Date.now()-start)/1000,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState};

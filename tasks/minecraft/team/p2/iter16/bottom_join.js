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

// Current iteration15; stage controller adapted from P4 actual prior traversal. Owner executes only own player.
const p4Started=Date.now(),p4Body=bot.entity,p4HP=bot.health,p4Dim=bot.game.dimension,p4CountRod=()=>bot.inventory.items().filter(i=>i.name==='blaze_rod').reduce((n,i)=>n+i.count,0),p4RodBefore=p4CountRod();let p4Hands=[];
const P4Vec=require('vec3').Vec3,p4Full=q=>{const b=bot.blockAt(q);return b&&!/lava|water|fire|magma|gravel|^sand$/.test(b.name)&&b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')},p4Caps=()=>bot.inventory.items().filter(i=>['nether_bricks','netherrack','basalt','blackstone','cobblestone','cobbled_deepslate','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','tuff','sandstone','dirt','granite','andesite','diorite'].includes(i.name)).reduce((n,i)=>n+i.count,0),p4Face=q=>[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(a=>q.offset(...a));
const p4Native=q=>{const b=bot.blockAt(q);return p4Full(q)&&['nether_bricks','netherrack','basalt','blackstone','cobblestone','cobbled_deepslate','stone','deepslate','tuff','sandstone','granite','diorite','andesite','stone_bricks','mossy_stone_bricks','cracked_stone_bricks'].includes(b.name)};
const p4ColumnStart=global.p2ShaftTop||bot.entity.position.floored().clone();
function p4Outer(cells){const body=new Set(cells.flatMap(q=>[q.toArray().join(','),q.offset(0,1,0).toArray().join(',')]));return cells.every(q=>p4Face(q).filter(f=>!body.has(f.toArray().join(','))).every(p4Full))}
async function p4HandGuard(q,b){if(bot.entity!==p4Body||bot.game.dimension!==p4Dim||bot.health<=0||bot.health<p4HP)throw Error('HAND_BODY_DAMAGE');const here=bot.entity.position.floored(),next=q.y<here.y?q.clone():new P4Vec(q.x,here.y,q.z);let cells=[here,next];if(true&&next.x===p4ColumnStart.x&&next.z===p4ColumnStart.z&&next.y<=here.y)cells=Array.from({length:p4ColumnStart.y-next.y+1},(_,i)=>new P4Vec(next.x,next.y+i,next.z));if(!p4Outer(cells)){const tube=p3ClosedTube(bot,here,next,12,p4Full);if(!tube.ok)throw Error('HAND_'+tube.issue);}const reserve=next.y<here.y?1:2;if(p4Caps()<reserve)throw Error('HAND_ENDING_RESERVE_'+reserve);if(!b||!p4Native(q))throw Error('HAND_NATIVE_FLOOR_OR_CAP_ONLY');await bot.unequip('hand');await bot.waitForTicks(4);if(bot.heldItem)throw Error('HAND_ACK');const price=bot.digTime(b);if(!Number.isFinite(price)||Date.now()+price>p4Started+55000)throw Error('HAND_WHOLE_TIME_PRICE');p4Hands.push({q:q.toArray(),name:b.name,priceMs:price,harvest:false,lossExpected:true});}

let p4Result;try{p4Result=await(async()=>{
if(bot.game.dimension!=='the_nether')throw Error('WORLD');global.P4UMode='bottom';global.P4UGoalY=11;global.P4USteps=8;global.P4UWorkMs=40000;
// Scoped survival mining. Every operation finishes at a measured closed capsule.
const {Vec3}=require('vec3');const begun=Date.now(),workEnd=begun+(global.P4UWorkMs||40000),hardEnd=begun+65000;let lost=false,issue=null,cuts=0,steps=0,down=0;
const dim=bot.game.dimension,origin=bot.entity.position.clone();const dirs=[new Vec3(1,0,0),new Vec3(-1,0,0),new Vec3(0,0,1),new Vec3(0,0,-1)];
const full=q=>{const b=bot.blockAt(q);if(!b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'))return false;if(!['sand','gravel'].includes(b.name))return !['magma_block','suspicious_sand','suspicious_gravel'].includes(b.name);for(let n=1;n<=16;n++){const below=bot.blockAt(q.offset(0,-n,0));if(!below?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'))return false;if(!['sand','gravel'].includes(below.name))return true;}return false;};
const solidNames=['nether_bricks','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','basalt','blackstone','netherrack','gravel','sand','stone','sandstone','dirt','grass_block','granite','diorite','andesite','cobblestone','deepslate','cobbled_deepslate','tuff','coal_ore','iron_ore','copper_ore','deepslate_iron_ore','deepslate_coal_ore','deepslate_copper_ore','diamond_ore','deepslate_diamond_ore','spruce_planks'];
const air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name);const stock=()=>bot.inventory.items().find(i=>['nether_bricks','cobbled_deepslate','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','tuff','basalt','cobbled_deepslate','netherrack','warped_planks','cobblestone','cobbled_deepslate','dirt','sandstone','granite','diorite','andesite','tuff','spruce_planks'].includes(i.name));
function stop(){bot.pathfinder.setGoal(null);bot.clearControlStates();}function death(){lost=true;stop();bot.stopDigging();}bot.on('death',death);bot.on('respawn',death);bot.on('end',death);stop();bot.pathfinder.LOSWhenPlacingBlocks=false;
function check(){if(Date.now()>1792257629000-5000)throw Error('CURRENT_DEADLINE');if(lost||bot.game.dimension!==dim||bot.health<7||bot.health<p4HP||Date.now()>hardEnd||Date.now()>1792257629000)throw Error('LIFE_TIME_HP');}async function tick(n=1){check();await bot.waitForTicks(n);check();}
function shell(p){return full(p.offset(0,-1,0))&&full(p.offset(0,2,0))&&dirs.every(d=>[0,1].every(y=>full(p.plus(d).offset(0,y,0))))}
async function center(p){for(const a of['x','z']){for(let n=0;n<35&&Math.abs(bot.entity.position[a]-p[a]-.5)>.05;n++){await bot.lookAt(bot.entity.position.offset(a==='x'?Math.sign(p[a]+.5-bot.entity.position[a])*2:0,1.4,a==='z'?Math.sign(p[a]+.5-bot.entity.position[a])*2:0),true);bot.setControlState('sneak',true);bot.setControlState('forward',true);await tick();bot.clearControlStates();}if(Math.abs(bot.entity.position[a]-p[a]-.5)>.14)throw Error('CENTER');}}
async function cut(q){check();if(air(q))return;const b=bot.blockAt(q);if(!solidNames.includes(b?.name))throw Error('CUT_KIND_'+b?.name+'_'+q);const durations={wooden_pickaxe:59,stone_pickaxe:131,iron_pickaxe:250,diamond_pickaxe:1561,netherite_pickaxe:2031,golden_pickaxe:32},priority={diamond_pickaxe:2,netherite_pickaxe:0,iron_pickaxe:1,stone_pickaxe:0,wooden_pickaxe:3,golden_pickaxe:4};const pick=bot.inventory.items().filter(i=>durations[i.name]&&i.durabilityUsed<durations[i.name]).sort((a,b)=>priority[a.name]-priority[b.name])[0];if(!pick){await p4HandGuard(q,b);if(Date.now()+bot.digTime(b)>hardEnd-8000)throw Error('HAND_CUT_BOUND');await bot.dig(b,true);await tick(2);if(!air(q))throw Error('HAND_CUT_ACK');cuts++;return;}if(b.name.includes('diamond_ore')&&!['iron_pickaxe','diamond_pickaxe','netherite_pickaxe'].includes(pick.name))throw Error('DIAMOND_HARVEST_TOOL');await bot.equip(pick,'hand');if(Date.now()+bot.digTime(b)>hardEnd-8000)throw Error('CUT_BOUND');await bot.dig(b,true);await tick(1);if(!air(q))throw Error('CUT_ACK_'+q);cuts++;}
async function put(q){if(full(q))return;if(!air(q))throw Error('CAP_OCCUPIED_'+q+'_'+bot.blockAt(q)?.name);const it=stock();if(!it)throw Error('CAP_STOCK');const faces=[new Vec3(0,-1,0),...dirs,new Vec3(0,1,0)],d=faces.find(d=>full(q.plus(d)));if(!d)throw Error('CAP_REF_'+q);await bot.equip(it,'hand');if(bot.currentWindow)bot.closeWindow(bot.currentWindow);bot.setControlState('sneak',true);try{await bot.placeBlock(bot.blockAt(q.plus(d)),d.scaled(-1));}finally{bot.setControlState('sneak',false);}await tick(2);if(!full(q))throw Error('CAP_ACK_'+q);console.log('PUT_ACTUAL',q.toArray(),it.name,p4Caps());}
async function closure(){stop();for(let n=0;n<30&&!bot.entity.onGround;n++)await tick();const p=bot.entity.position.floored();if(!bot.entity.onGround||bot.entity.isInWater||Math.abs(bot.entity.position.y-p.y)>.1)throw Error('CLOSE_BODY');
if(p.y===8){await center(p);await put(p.offset(0,2,0));const t=p3ClosedTube(bot,p,p,512,full);if(t.ok){console.log('LOW_HORIZONTAL_COMPOUND',t.cells.length,p.toArray());return true;}console.log('LOW_COMPOUND_FAILED',t.issue);for(const d of dirs)for(const y of[0,1])await put(p.plus(d).offset(0,y,0));if(!shell(p))throw Error('BOTTOM_LOCAL_SHELL');return true;}
for(const d of dirs)for(const y of[0,1])await put(p.plus(d).offset(0,y,0));const column=Array.from({length:p4ColumnStart.y-p.y+1},(_,i)=>p.offset(0,i,0));if(!p4Outer(column))throw Error('COLUMN_ENDING_NOT_FULL');global.p2ShaftTop=p4ColumnStart.clone();console.log('COLUMN_ENDING',p.toArray(),p4ColumnStart.toArray(),p4ColumnStart.y+2);global.P4U={p:p.clone(),at:Date.now()};return true;}
try{
 const p=bot.entity.position.floored();if(p.x!==-54||p.z!==64)throw Error('WRONG_COLUMN');if(!bot.entity.onGround||bot.entity.isInWater)throw Error('START_BODY');if(!p4Outer(Array.from({length:p4ColumnStart.y-p.y+1},(_,i)=>p.offset(0,i,0)) ))throw Error('SHAFT_START_FULL');await center(p);
 const mode=global.P4UMode||'south';
 if(mode==='bottom'){
  if(p.y!==11||!full(p.offset(0,-1,0))||!air(new Vec3(-54,9,64))||!air(new Vec3(-54,8,64))||!full(new Vec3(-54,7,64)))throw Error('BOTTOM_ACTUAL_GEOMETRY');
  const landing=new Vec3(-54,8,64),low=p3ClosedTube(bot,landing,landing,512,full);
  if(!low.ok)throw Error('BOTTOM_LOW_'+low.issue);
  if(!dirs.every(d=>full(new Vec3(-54,10,64).plus(d))))throw Error('BOTTOM_JOIN_SIDES');
  if(!p4Outer(Array.from({length:p4ColumnStart.y-p.y+1},(_,i)=>p.offset(0,i,0))))throw Error('BOTTOM_UPPER_BOUNDARY');
  if(p4Caps()<1)throw Error('BOTTOM_ROOF_RESERVE');
  const q=new Vec3(-54,10,64),b=bot.blockAt(q);if(!p4Native(q))throw Error('BOTTOM_FLOOR_KIND');
  await bot.unequip('hand');await tick(4);const price=bot.digTime(b);if(bot.heldItem||Date.now()+price>hardEnd-12000)throw Error('BOTTOM_TIME_HAND');
  console.log('BOTTOM_PREQUALIFIED',low.cells.length,'cut',q.toArray(),'ms',price);p4Hands.push({q:q.toArray(),name:b.name,priceMs:price,harvest:false,lossExpected:true});
  await bot.dig(b,true);cuts++;for(let n=0;n<50&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-8)>.1);n++)await tick();
  if(!bot.entity.onGround||Math.abs(bot.entity.position.y-8)>.1)throw Error('BOTTOM_LANDING_NOT8');down=3;
 }else if(mode==='entry'){
  const p=bot.entity.position.floored();if(![-1,-2,-3,-4].every(y=>full(p.offset(0,y,0)))||!dirs.every(d=>[-3,-2].every(y=>full(p.plus(d).offset(0,y,0)))))throw Error('ENTRY_ENVELOPE');for(let y=-1;y>=-3;y--){const q=p.offset(0,y,0);await cut(q);for(let n=0;n<30&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.1);n++)await tick();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.1)throw Error('ENTRY_FALL');down++;}
 }else if(mode==='down'){
  const goalY=global.P4UGoalY||40;while(bot.entity.position.y>goalY+.1&&Date.now()<workEnd){const p=bot.entity.position.floored(),floor=p.offset(0,-1,0),next=p.offset(0,-1,0);if(Date.now()+bot.digTime(bot.blockAt(floor))+1000>workEnd)break;await put(p.offset(0,-2,0));for(const d of dirs)for(const y of[0,1])await put(next.plus(d).offset(0,y,0));if(!full(floor)||!full(p.offset(0,-2,0))||!dirs.every(d=>[0,1].every(y=>full(next.plus(d).offset(0,y,0)))))throw Error('DESCENT_ENVELOPE_'+floor);await cut(floor);for(let n=0;n<30&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-next.y)>.1);n++)await tick();if(!bot.entity.onGround||!bot.entity.position.floored().equals(next)||Math.abs(bot.entity.position.y-next.y)>.1)throw Error('DOWN_SETTLE');down++;await tick(6);}
 }else{
  const d=new Vec3(...(global.P4UDir||[0,0,1]));const side=dirs.filter(v=>Math.abs(v.dot(d))<.1);const max=global.P4USteps??16;
  while(steps<max&&Date.now()<workEnd){const p=bot.entity.position.floored(),q=p.plus(d);const envelope=[q,q.offset(0,1,0),q.offset(0,-1,0),q.offset(0,2,0),q.plus(d),q.plus(d).offset(0,1,0),...side.flatMap(s=>[q.plus(s),q.plus(s).offset(0,1,0)])];if((!envelope.every(v=>full(v))||["sand","gravel"].includes(bot.blockAt(q.offset(0,2,0)).name)))throw Error('HEADING_ENVELOPE_'+q+'_'+envelope.filter(v=>!full(v)).map(v=>v+':'+bot.blockAt(v)?.name).join(';'));
   await cut(q.offset(0,1,0));await cut(q);await bot.lookAt(q.offset(.5,1.4,.5),true);bot.setControlState('forward',true);try{for(let n=0;n<24&&bot.entity.position.minus(q.offset(.5,0,.5)).dot(d)<-.08;n++)await tick();}finally{stop();}await tick(2);if(!bot.entity.onGround||!bot.entity.position.floored().equals(q)||Math.abs(bot.entity.position.y-q.y)>.1)throw Error('HEADING_BODY');steps++;}
 }
}catch(e){issue=e.message;console.log('ISSUE',issue)}finally{stop();let closed=false;try{closed=await closure();}catch(e){console.log('CLOSURE_FAIL',e.message);}bot.removeListener('death',death);bot.removeListener('respawn',death);bot.removeListener('end',death);return {p:bot.entity.position,hp:bot.health,food:bot.food,cuts,steps,down,seconds:(Date.now()-begun)/1000,issue,closed,lost,delta:bot.entity.position.distanceTo(origin),inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};}

return{issue,full:shell(bot.entity.position.floored()),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,cuts,down,own:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

})();}finally{bot.clearControlStates();bot.pathfinder.setGoal(null);}
return{...p4Result,p:bot.entity.position.clone(),hp:bot.health,rodBefore:p4RodBefore,rodAfter:p4CountRod(),rodPreserved:p4CountRod()===p4RodBefore,handCuts:p4Hands,hpActual:bot.health,bodyActual:bot.entity.position.clone(),stage:'shaft_down',qualification:'Current caller source adapted from prior physical path; actual current-stage receipt required.'};

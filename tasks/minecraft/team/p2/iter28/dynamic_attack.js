const V=bot.entity.position.constructor;
const v=(x,y,z)=>new V(x,y,z), sleep=n=>bot.waitForTicks(n);
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0);
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),wear:bot.inventory.items().filter(i=>i.durabilityUsed!=null).map(i=>[i.name,i.durabilityUsed,i.maxDurability]),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(n=>[n,bot.getControlState(n)])),goal:bot.pathfinder.goal,window:bot.currentWindow?.type,cursor:bot.inventory.selectedItem?.name});
const offsets=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
const audit=(q=bot.entity.position.floored())=>offsets.map(d=>({p:q.offset(...d),name:bot.blockAt(q.offset(...d))?.name,full:full(q.offset(...d))}));
let dead=false;const died=()=>{dead=true;bot.clearControlStates();bot.pathfinder.setGoal(null);};bot.on('death',died);
const alive=()=>{if(dead||bot.health<=0)throw Error('life changed');};
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.01,.5],[.5,.99,.5],[.99,.5,.5],[.01,.5,.5],[.5,.5,.99],[.5,.5,.01]]){await bot.lookAt(q.offset(...a),true);await sleep(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return c;}throw Error('not visible '+q);}
async function cut(q,allowed=null){alive();const b=bot.blockAt(q);if(['air','cave_air'].includes(b?.name))return;if(allowed&&!allowed.includes(b?.name))throw Error('cut material '+q+' '+b?.name);const tool=bot.inventory.items().find(i=>i.name===(count('stone_pickaxe')?'stone_pickaxe':'wooden_pickaxe'));if(['stone','diorite','cobblestone','blackstone','end_stone','netherrack','basalt','sandstone','granite','nether_bricks','cobbled_deepslate','tuff','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','andesite','deepslate'].includes(b?.name)&&tool)await bot.equip(tool,'hand');else await bot.unequip('hand');const selectedFace=await face(q);await bot.dig(bot.blockAt(q),'ignore',dirs[selectedFace.face]);await sleep(5);alive();if(!['air','cave_air'].includes(bot.blockAt(q)?.name))throw Error('cut postcondition');console.log('CUT',q,b.name);}
const dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];
async function put(q,name=null){alive();if(full(q))return;const names=name?[name]:['dirt','cobblestone','diorite','spruce_planks','netherrack','end_stone','basalt','blackstone','sandstone','granite'];for(const f of[0,1,3,5,4,2]){const ref=q.minus(dirs[f]);if(!full(ref))continue;try{await face(ref,f);}catch(e){continue;}const item=names.map(n=>bot.inventory.items().find(i=>i.name===n)).find(Boolean);if(!item)throw Error('no cap');await bot.equip(item,'hand');const interact=['crafting_table','chest','furnace'].includes(bot.blockAt(ref)?.name);if(interact)bot.setControlState('sneak',true);try{await bot.placeBlock(bot.blockAt(ref),dirs[f]);}finally{bot.setControlState('sneak',false);}await sleep(5);if(!full(q))throw Error('cap postcondition');console.log('PUT',q,item.name);return;}throw Error('no visible cap anchor '+q);}
async function flat(q,ms=3500){const y=bot.entity.position.y,t=Date.now();try{while(Math.hypot(bot.entity.position.x-q.x,bot.entity.position.z-q.z)>.1&&Date.now()-t<ms){alive();await bot.lookAt(v(q.x,y+bot.entity.eyeHeight,q.z),true);bot.setControlState('forward',true);await sleep(1);bot.setControlState('forward',false);await sleep(1);if(Math.abs(bot.entity.position.y-y)>.05)throw Error('flat height changed');}}finally{bot.clearControlStates();}await sleep(8);if(!bot.entity.onGround||bot.entity.position.distanceTo(q)>.22)throw Error('flat unsettled');}
async function pillar(name=null){alive();const a=bot.entity.position.floored(),ref=a.offset(0,-1,0),item=bot.inventory.items().find(i=>i.name===(name||'dirt'))||bot.inventory.items().find(i=>i.name==='spruce_planks');if(!item||!full(ref))throw Error('pillar funding/support');await bot.equip(item,'hand');bot.setControlState('jump',true);try{for(let k=0;k<18&&bot.entity.position.y<a.y+1.025;k++)await sleep(1);if(bot.entity.position.y<a.y+1.025)throw Error('pillar headroom');await face(ref,1);await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}await sleep(12);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03)throw Error('pillar unsettled');console.log('UP',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health}));}
async function craft(name,table=null){if(bot.currentWindow)bot.closeWindow(bot.currentWindow);for(let k=1;k<=4;k++)if(bot.inventory.slots[k])await bot.putAway(k);const before=count(name),r=bot.recipesFor(bot.registry.itemsByName[name].id,null,1,table)[0];if(!r)throw Error('unfunded '+name);if(table)await face(table.position);await bot.craft(r,1,table);await sleep(10);if(bot.inventory.selectedItem){const empty=Array.from({length:36},(_,i)=>i+9).find(i=>!bot.inventory.slots[i]);if(empty!==undefined){await bot.clickWindow(empty,0,0);await sleep(5);}}if(bot.currentWindow)bot.closeWindow(bot.currentWindow);console.log('CRAFT',name,before,count(name),JSON.stringify(state()));if(count(name)!==before+r.result.count)throw Error('craft receipt '+name);}
async function seal(verbose=false){alive();bot.pathfinder.setGoal(null);bot.clearControlStates();const q=bot.entity.position.floored();for(const d of [[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[1,1,0],[-1,1,0],[0,1,1],[0,1,-1],[0,2,0]])if(!full(q.offset(...d))){if(d[1]===2)await roofClose(q);else await put(q.offset(...d));}for(let j=0;j<3;j++){if(!audit().every(r=>r.full))throw Error('seal audit changed');if(verbose)console.log('ENDING',JSON.stringify({state:state(),faces:audit()}));await sleep(5);}}
function stop(){bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',died);}
async function refuge(){alive();if(bot.entity.onGround&&audit().every(a=>a.full)){await seal();return;}bot.pathfinder.setGoal(null);bot.clearControlStates();await sleep(5);let q=bot.entity.position.floored();if(!bot.entity.onGround)await sleep(10);q=bot.entity.position.floored();for(let depth=1;depth<=4;depth++){const dest=q.offset(0,-depth,0);if(!full(dest.offset(0,-1,0))||![[1,-1,0],[-1,-1,0],[0,-1,1],[0,-1,-1]].every(d=>full(dest.offset(...d)))||!Array.from({length:depth},(_,i)=>q.offset(0,-1-i,0)).every(full))continue;await flat(v(q.x+.5,bot.entity.position.y,q.z+.5));for(let j=0;j<depth;j++){const a=bot.entity.position.floored();await cut(a.offset(0,-1,0));await sleep(10);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y+1)>.03)throw Error('refuge down unsettled');}await seal();return;}
if(full(q.offset(0,-1,0))&&Math.abs(bot.entity.position.y-q.y)<.03)await flat(q.offset(.5,0,.5));await seal();}
async function travel(q,ms=45000,radius=0,dig=false,minHp=12){const m=new Movements(bot);m.canDig=dig;for(const n of ['white_bed','chest','crafting_table','obsidian','nether_portal','bedrock','end_portal_frame','end_portal'])if(bot.registry.blocksByName[n])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.maxDropDown=1;m.exclusionAreasStep.push(b=>['water','lava'].includes(b.name)||['water','lava'].includes(bot.blockAt(b.position.offset(0,1,0))?.name)?100:0);bot.pathfinder.setMovements(m);const goal=radius?new goals.GoalNear(q.x,q.y,q.z,radius):new goals.GoalBlock(q.x,q.y,q.z);const dim=bot.game.dimension,start=Date.now();let last=bot.entity.position.clone(),progress=Date.now(),log=0;const diggingProgress=()=>{progress=Date.now();};bot.on('diggingCompleted',diggingProgress);bot.pathfinder.setGoal(goal);try{while(bot.pathfinder.goal&&Date.now()-start<ms){await sleep(2);alive();if(bot.game.dimension!==dim){console.log('TRANSITION',JSON.stringify(state()));return;}if(bot.health<minHp)throw Error('travel HP stop');if(['water','lava'].includes(bot.blockAt(bot.entity.position.floored())?.name))throw Error('travel fluid');if(bot.entity.position.distanceTo(last)>.35){last=bot.entity.position.clone();progress=Date.now();}if(Date.now()-progress>5000)throw Error('travel stalled');if(Date.now()-log>5000){console.log('TRAVEL',JSON.stringify(state()));log=Date.now();}}}finally{bot.removeListener('diggingCompleted',diggingProgress);bot.pathfinder.setGoal(null);bot.clearControlStates();}await sleep(8);console.log('TRAVEL_END',JSON.stringify(state()));if(!goal.isEnd(bot.entity.position.floored()))throw Error('travel goal absent');}

async function roofClose(q){const roof=q.offset(0,2,0);if(full(roof))return;try{await put(roof);return;}catch(e){console.log('ROOF_NEEDS_THIRD',String(e));}for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){const ref=q.offset(d[0],1,d[2]),third=ref.offset(0,1,0);if(!full(ref)||!['air','cave_air'].includes(bot.blockAt(third)?.name))continue;const item=bot.inventory.items().find(i=>['dirt','cobblestone','spruce_planks','netherrack','end_stone','basalt'].includes(i.name));if(!item)throw Error('third funding');await bot.equip(item,'hand');bot.setControlState('jump',true);try{for(let k=0;k<15&&bot.entity.position.y<q.y+.65;k++)await sleep(1);if(bot.entity.position.y<q.y+.65)throw Error('third jump');await face(ref,1);await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}await sleep(16);if(!full(third))throw Error('third postcondition');console.log('P4_THIRD',third);await put(roof);return;}throw Error('roof third unavailable');}

// Public bot state only. No movement, digging, placement, attacks or visibility admission.
// Owner MUST call forward() before mutations AND after each awaited operation inside helpers.
// A wrapper around a multi-await helper does not cancel that helper's remaining instructions.
function makeOperationGuard(bot) {
  const body = bot.entity, dimension = bot.game.dimension, startHp = bot.health;
  let dead = false, damaged = false, mode = 'forward', closed = false, lastHp = startHp;
  const failures = [];
  const floorNames = new Set([
    'end_stone', 'basalt', 'blackstone', 'cobbled_deepslate',
    'stone_bricks', 'mossy_stone_bricks', 'cracked_stone_bricks',
    'nether_bricks', 'sand', 'sandstone', 'netherrack', 'cobblestone'
  ]);
  const stopForward = () => { bot.clearControlStates(); bot.pathfinder.setGoal(null); };
  const onDeath = () => { dead = true; stopForward(); };
  const onHealth = () => {
    if (bot.health < lastHp) {
      damaged = true;
      if (mode === 'forward') stopForward();
    }
    lastHp = bot.health;
  };
  bot.on('death', onDeath); bot.on('health', onHealth);
  const fail = (label, why) => {
    const row = {label, why, hp: bot.health, p: bot.entity.position.clone(), mode};
    if (failures.length < 8) failures.push(row);
    throw Error('OPERATION_GUARD ' + label + ': ' + why);
  };
  const alive = label => {
    if (closed || dead || bot.health <= 0 || bot.entity !== body || bot.game.dimension !== dimension)
      fail(label, 'life/dimension/guard changed');
  };
  return {
    forward(label) {
      alive(label);
      onHealth(); // Also reconcile a changed health value before its event is observed.
      if (mode !== 'forward') fail(label, 'escape mode is irreversible in this operation');
      if (damaged || bot.health < startHp) { stopForward(); fail(label, 'HP loss: forward work retired'); }
    },
    beginEscape(label) { alive(label); mode = 'escape'; stopForward(); },
    escape(label) { alive(label); if (mode !== 'escape') fail(label, 'call beginEscape first'); },
    escapeFloor(label) {
      alive(label);
      if (mode !== 'escape') fail(label, 'call beginEscape first');
      const p = bot.entity.position;
      if (!bot.entity.onGround || Math.abs(p.y - Math.round(p.y)) > .04)
        fail(label, 'need actual settled grounded feet before selecting floor');
      const q = p.floored(); q.y = Math.round(p.y) - 1;
      const b = bot.blockAt(q);
      if (!b || !floorNames.has(b.name) || !b.shapes?.some(s => s.join(',') === '0,0,0,1,1,1'))
        fail(label, 'unqualified actual floor ' + b?.name);
      return {position: q, name: b.name};
      // Owner still checks actual reachable visible cursor, supported destination, tool,
      // budget and retreat geometry before ordinary digging. This is NOT action admission.
    },
    report() { return {startHp, hp: bot.health, damaged, dead, mode, failures: [...failures]}; },
    close() { if (!closed) { bot.removeListener('death', onDeath); bot.removeListener('health', onHealth); closed = true; } }
  };
}

// Public Mineflayer events only; no actions, reach decisions, or private protocol.
// const trace = makeHazardRecorder(bot); try { ...owner actions... }
// finally { console.log('HAZARD_TRACE', JSON.stringify(trace.stop())); }
function makeHazardRecorder(bot, limit=48) {
  const requestedLimit=limit; limit=Math.min(48,Math.max(3,Math.floor(limit)));
  const rows=[], bindings=[], start=Date.now(); let tick=0,dropped=0,done=false;
  const xyz=p=>p?{x:p.x,y:p.y,z:p.z}:null;
  const relevant=e=>e&&['area_effect_cloud','dragon_fireball'].includes(e.name);
  const entity=e=>({id:e.id,name:e.name,p:xyz(e.position)});
  const add=(event,extra={})=>{
    const r={at:new Date().toISOString(),ms:Date.now()-start,event,
      p:xyz(bot.entity?.position),hp:bot.health,food:bot.food,
      ground:bot.entity?.onGround,loadedHazardCount:loadedHazardCount(),...extra};
    if(rows.length>=limit){let index=rows.findIndex((x,i)=>i>0&&x.event==='sample');if(index<0)index=1;rows.splice(index,1);dropped++;}rows.push(r);
  };
  const near=()=>Object.values(bot.entities).filter(relevant).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position)).slice(0,2).map(entity);
  const loadedHazardCount=()=>Object.values(bot.entities).filter(relevant).length;
  const bind=(event,fn)=>{bot.on(event,fn);bindings.push([event,fn]);};
  add('start',{entities:near()});
  bind('health',()=>add('health',{entities:near()}));
  bind('death',()=>add('death'));
  for(const event of ['entitySpawn','entityGone','entityHurt'])
    bind(event,e=>{if(relevant(e)||e===bot.entity)add(event,{entity:entity(e)});});
  bind('physicsTick',()=>{if(++tick%5===0)add('sample',{entities:near()});});
  return {
    mark(label){if(!done)add('mark',{label,entities:near()});},
    stop(){if(!done){for(const[e,f]of bindings)bot.removeListener(e,f);done=true;add('stop',{entities:near()});}
      return{rows,dropped,requestedLimit,effectiveLimit:limit,elapsedMs:Date.now()-start,listenersRemoved:done};}
  };
}

async function stepStair(q,prepareOnly=false){
 forward('step begin');const a=bot.entity.position.floored(),center=q.offset(.5,0,.5);
 if(!bot.entity.onGround||Math.abs(q.x-a.x)+Math.abs(q.z-a.z)!==1||Math.abs(q.y-a.y)>1)throw Error('stairgeometry');
 if(!full(q.offset(0,-1,0)))throw Error('stairactualsupport '+q);
 if(q.y>a.y&&full(a.offset(0,2,0))){await cut(a.offset(0,2,0),['end_stone','basalt']);forward('after ownheadcut');}
 if(q.y<a.y&&full(q.offset(0,2,0))){await cut(q.offset(0,2,0),['end_stone','basalt']);forward('after downheadcut');}
 for(const cell of[q.offset(0,1,0),q]){const b=bot.blockAt(cell);if(!['air','cave_air'].includes(b?.name)){await cut(cell,['end_stone','basalt']);forward('after nextcut');}}
 if(prepareOnly)return;
 const started=Date.now();try{while(Date.now()-started<3500){
  forward('step loop');if(bot.entity.position.distanceTo(center)<.16&&bot.entity.onGround)break;
  await bot.lookAt(v(center.x,bot.entity.position.y+bot.entity.eyeHeight,center.z),true);forward('after steplook');
  bot.setControlState('forward',true);if(q.y>a.y&&bot.entity.position.y<q.y-.05)bot.setControlState('jump',true);
  await sleep(1);forward('after step tick');bot.setControlState('forward',false);bot.setControlState('jump',false);
  await sleep(1);forward('after step settle');if(bot.entity.position.y<q.y-1.1)throw Error('fellbelowstair');
 }}finally{bot.clearControlStates();}
 await sleep(5);forward('step post');if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03||bot.entity.position.distanceTo(center)>.25)throw Error('stairpost');
 console.log('ACTUAL_STAIR',JSON.stringify({at:new Date().toISOString(),target:q,p:bot.entity.position,hp:bot.health}));
}

async function fastWalkStep(q){
 walkCheck('fastwalkstart');const a=bot.entity.position.floored(),center=q.offset(.5,0,.5);
 if(!bot.entity.onGround||Math.abs(q.x-a.x)+Math.abs(q.z-a.z)!==1||q.y>a.y||a.y-q.y>1||!full(q.offset(0,-1,0)))throw Error('fastwalk actualgeometry');
 for(const b of[q,q.offset(0,1,0),...(q.y<a.y?[q.offset(0,2,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(b)?.name))throw Error('fastwalk unclearedcell '+b+' '+bot.blockAt(b)?.name);
 await bot.lookAt(v(center.x,bot.entity.position.y+bot.entity.eyeHeight,center.z),true);walkCheck('fastwalklook');const began=Date.now();
 bot.setControlState('forward',true);try{while(Math.hypot(bot.entity.position.x-center.x,bot.entity.position.z-center.z)>.14&&Date.now()-began<1800){await sleep(1);walkCheck('fastwalktick');}}finally{bot.clearControlStates();}
 for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03);k++){await sleep(1);walkCheck('fastwalkfall');}await sleep(2);walkCheck('fastwalklanded');if(bot.entity.onGround&&Math.abs(bot.entity.position.y-q.y)<.03&&bot.entity.position.distanceTo(center)>.12){console.log('ACTUAL_STEP_RECENTER',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,target:q}));await flat(center);walkCheck('aftersteprecenter');}walkCheck('fastwalkpost');
 console.log('ACTUAL_WALK_STEP',JSON.stringify({at:new Date().toISOString(),target:q,p:bot.entity.position,hp:bot.health,elapsedMs:Date.now()-began}));
 if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03||bot.entity.position.distanceTo(center)>.32)throw Error('fastwalkpost');
}

// Ordinary walking only: reconcile actual landed ledge before indexing prepared steps.
async function escapePreparedRoute(route,guard){
 guard.beginEscape('preparedactualwalk');bot.pathfinder.setGoal(null);bot.clearControlStates();
 for(let k=0;k<30&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-Math.round(bot.entity.position.y))>.03);k++){guard.escape('actualledgefall');await sleep(1);}
 if(!bot.entity.onGround)throw Error('actualledgefailedtoland');let q=bot.entity.position.floored(),idx=route.findIndex(r=>r.equals(q));
 if(idx<0){const candidates=route.map((r,i)=>({r,i,dist:r.offset(.5,0,.5).distanceTo(bot.entity.position)})).filter(o=>Math.abs(o.r.y-bot.entity.position.y)<.03&&o.dist<=1.25&&full(o.r.offset(0,-1,0))&&[o.r,o.r.offset(0,1,0)].every(c=>['air','cave_air'].includes(bot.blockAt(c)?.name))).sort((a,b)=>a.dist-b.dist);if(!candidates.length)throw Error('actualledgeoffpreparedroute');console.log('ACTUAL_LEDGE_RECENTER',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,target:candidates[0].r}));await flat(candidates[0].r.offset(.5,0,.5));guard.escape('afterphysicalrecenter');idx=candidates[0].i;}
 console.log('ACTUAL_PREPARED_ESCAPE_START',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,idx}));
 for(let k=idx-1;k>=0;k--){guard.escape('nextpreparedstep');const target=route[k],a=bot.entity.position.floored();for(const c of[target.offset(0,1,0),target,...(target.y<a.y?[target.offset(0,2,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(c)?.name))await cut(c,['end_stone','basalt']);await fastWalkStep(target);}
 await seal(true);
}

console.log('ENVIRONMENT G28-1 FULL dynamic57step+apexjump ONE ordinary actual attack; whole01:54–02:02');
const route=[[-11,50,-11],[-11,50,-12],[-10,51,-12],[-9,52,-12],[-8,53,-12],[-7,54,-12],[-6,55,-12],[-5,56,-12],[-4,57,-12]].map(q=>v(...q));
let bestRow=null;const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now(),events=[],rows=[];let phase='prepare',escaping=false,hazard=false,admitted=false,attacked=false,samples=0,best=Infinity;
const dragon=()=>Object.values(bot.entities).find(e=>e.name==='ender_dragon');
const info=e=>e?({id:e.id,name:e.name,p:e.position.clone(),velocity:e.velocity?.clone(),width:e.width,height:e.height}):null;
const onHurt=e=>{if(e.name==='ender_dragon')events.push({at:new Date().toISOString(),event:'dragonHurt',e:info(e)});};
const onBoss=b=>events.push({at:new Date().toISOString(),event:'bossBar',health:b.health,title:String(b.title),dragon:b.isDragonBar});
const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazard=true;events.push({at:new Date().toISOString(),event:'fireball',p:bot.entity.position.clone(),e:info(e)});if(!escaping&&phase==='prepare'){bot.clearControlStates();try{const r=bot.stopDigging();if(r?.catch)r.catch(()=>{});}catch{}}}};
bot.on('entityHurt',onHurt);bot.on('bossBarCreated',onBoss);bot.on('bossBarUpdated',onBoss);bot.on('entitySpawn',onSpawn);
function forward(label){guard.forward(label);if(hazard||Object.values(bot.entities).some(e=>(e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7)||(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48)))throw Error('actualhazard '+label);}
const walkCheck=l=>guard.escape(l);
const ray=point=>{const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),d=point.minus(eye);if(d.norm()<=.05)throw Error('degenerate aiming ray');return bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()-.01);};
function aimCandidate(d){const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),w=d.width/2,p=d.position;const nearest=v(Math.max(p.x-w+.02,Math.min(p.x+w-.02,eye.x)),Math.max(p.y+.02,Math.min(p.y+d.height-.02,eye.y)),Math.max(p.z-w+.02,Math.min(p.z+w-.02,eye.z)));return nearest.distanceTo(eye)>.05?nearest:d.position.offset(0,.2,0);}
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(route[0])||bot.health!==10||count('snowball')!==2||!audit().every(a=>a.full))throw Error('actualmeleesourcechanged');admitted=true;console.log('MELEE_ACTUAL_START',JSON.stringify(state()));
 for(const q of route.slice(1,-1))await stepStair(q);
 await stepStair(route.at(-1),true);forward('preparedfinalstep');await cut(route.at(-1).offset(0,2,0),['end_stone']);forward('preparedjumpheadroom');
 console.log('SMALL_DYNAMIC_PREPARED',JSON.stringify({state:state(),baseRoof:bot.blockAt(route.at(-2).offset(0,3,0))?.name,target:route.at(-1)}));
 await bot.equip(bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');
 const wait=Date.now(),futureEye=route.at(-1).offset(.5,1.25220334+bot.entity.eyeHeight,.5);
 for(let k=0;k<1400&&Date.now()-wait<70000;k++){
  forward('coveredverticalwindow');const d=dragon();if(!d)throw Error('dragonunloaded');const w=d.width/2,p=d.position;const candidate=v(Math.max(p.x-w+.02,Math.min(p.x+w-.02,futureEye.x)),Math.max(p.y+.02,Math.min(p.y+d.height-.02,futureEye.y)),Math.max(p.z-w+.02,Math.min(p.z+w-.02,futureEye.z)));const r=candidate.distanceTo(futureEye);samples++;if(r<best){best=r;bestRow={at:new Date().toISOString(),dragon:info(d),futureEye,candidate,model:r};}if(r<2.8){console.log('MODEL_DYNAMIC_TRIGGER_ONLY',JSON.stringify(bestRow));break;}await sleep(1);
 }
 if(best>=2.8)throw Error('no actual model jump window '+best);
 phase='commit';const commit=Date.now();await stepStair(route.at(-1));const baseY=bot.entity.position.y;await bot.lookAt(bot.entity.position.offset(0,12,0),true);bot.setControlState('jump',true);
 for(let k=0;k<10&&bot.entity.position.y<baseY+1.251;k++){await sleep(1);forward('actualdynamicjump');}
 bot.setControlState('jump',false);forward('actualairborne');
 const d=dragon(),point=aimCandidate(d),eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0);if(point.distanceTo(eye)>3||Date.now()-commit>3000||ray(point))throw Error('actual airborne range/view/time');
 await bot.lookAt(point,true);await sleep(1);forward('beforecurrentcursor');const actual=dragon(),current=aimCandidate(actual),cursor=bot.entityAtCursor(3),nowEye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),obstruction=ray(current);
 const row={at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,dragon:info(actual),aim:current,modelDistance:current.distanceTo(nowEye),centerDistance:actual.position.offset(0,actual.height/2,0).distanceTo(nowEye),cursor:info(cursor),obstruction:obstruction?{p:obstruction.position,name:obstruction.name}:null,commitMs:Date.now()-commit};rows.push(row);
 if(cursor!==actual||actual!==d||row.modelDistance>3||obstruction||Date.now()-commit>3000)throw Error('actual cursor/range/view/time refused '+JSON.stringify(row));
 console.log('ACTUAL_ORDINARY_MELEE',JSON.stringify(row));bot.attack(cursor);attacked=true;console.log('ORDINARY_ATTACK_RETURNED',new Date().toISOString());await sleep(1);
 if(!attacked)console.log('NO_ELIGIBLE_CURSOR',JSON.stringify({samples,best}));
}catch(e){console.log('FAILURE',String(e),JSON.stringify({at:new Date().toISOString(),state:state(),attacked,best}));}
finally{
 escaping=true;phase='escape';bot.clearControlStates();if(admitted)try{await escapePreparedRoute(route,guard);}catch(e){console.log('RECOVERY_FAILURE_IMMEDIATE',String(e),JSON.stringify(state()));try{await refuge();}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}
 for(let k=0;k<20&&bot.health>0;k++)await sleep(5);
 console.log('MELEE_ACTUAL_POST',JSON.stringify({at:new Date().toISOString(),state:state(),elapsedMs:Date.now()-began,attacked,best,bestRow,samples,events,rows,dragon:info(dragon())}));
 bot.removeListener('entityHurt',onHurt);bot.removeListener('bossBarCreated',onBoss);bot.removeListener('bossBarUpdated',onBoss);bot.removeListener('entitySpawn',onSpawn);console.log('OPERATION_GUARD',JSON.stringify(guard.report()));guard.close();console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

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
async function flat(q,ms=3500){const y=bot.entity.position.y,t=Date.now();try{while(Math.hypot(bot.entity.position.x-q.x,bot.entity.position.z-q.z)>.1&&Date.now()-t<ms){alive();await bot.lookAt(v(q.x,y-2,q.z),true);bot.setControlState('forward',true);await sleep(1);bot.setControlState('forward',false);await sleep(1);if(Math.abs(bot.entity.position.y-y)>.05)throw Error('flat height changed');}}finally{bot.clearControlStates();}await sleep(8);if(!bot.entity.onGround||bot.entity.position.distanceTo(q)>.22)throw Error('flat unsettled');}
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
  await bot.lookAt(v(center.x,bot.entity.position.y-2,center.z),true);forward('after steplook');
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
 await bot.lookAt(v(center.x,bot.entity.position.y-2,center.z),true);walkCheck('fastwalklook');const began=Date.now();
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

// Actual stable landing plus ordinary horizontal recenter onto a prepared supported ledge.
async function actualPreparedIndex(route,guard){
 guard.beginEscape('actualstableledge');bot.pathfinder.setGoal(null);bot.clearControlStates();let stable=0,lastY=null;
 for(let k=0;k<36;k++){guard.escape('actualstableledgewait');const p=bot.entity.position;const ok=bot.entity.onGround&&Math.abs(p.y-Math.round(p.y))<.03;if(ok&&lastY!==null&&Math.abs(lastY-p.y)<.01)stable++;else stable=0;lastY=p.y;if(stable>=3)break;await sleep(1);}
 if(stable<3||!bot.entity.onGround)throw Error('actuallandingnotstable');let q=bot.entity.position.floored(),idx=route.findIndex(r=>r.equals(q));
 if(idx<0){const choices=route.map((r,i)=>({r,i,dist:r.offset(.5,0,.5).distanceTo(bot.entity.position)})).filter(a=>Math.abs(a.r.y-bot.entity.position.y)<.03&&a.dist<=1.25&&full(a.r.offset(0,-1,0))&&[a.r,a.r.offset(0,1,0)].every(c=>['air','cave_air'].includes(bot.blockAt(c)?.name))).sort((a,b)=>a.dist-b.dist);if(!choices.length)throw Error('no actual prepared landing candidate');const chosen=choices[0];console.log('ACTUAL_OFFROUTE_RECENTER_BEGIN',JSON.stringify({at:new Date().toISOString(),state:state(),target:chosen.r,dist:chosen.dist,floor:bot.blockAt(chosen.r.offset(0,-1,0))?.name}));await flat(chosen.r.offset(.5,0,.5));guard.escape('afteractualphysicalrecenter');q=bot.entity.position.floored();idx=route.findIndex(r=>r.equals(q));console.log('ACTUAL_OFFROUTE_RECENTER_COMPLETE',JSON.stringify({at:new Date().toISOString(),state:state(),idx}));}
 if(idx<0||!bot.entity.onGround||Math.abs(bot.entity.position.y-route[idx].y)>.03)throw Error('actualreconciledpostcondition');console.log('ACTUAL_RECONCILED_INDEX',JSON.stringify({at:new Date().toISOString(),state:state(),idx}));return idx;
}
// Ordinary continuous walking down a prepared, straight supported segment.
// No per-cell centering pause; retain final actual ground/Y/position checks.
async function continuousWalkSegment(points,guard){
 guard.escape('continuous segment start');const start=points[0],end=points.at(-1),a=bot.entity.position.floored();
 if(!a.equals(start)||!bot.entity.onGround||points.length<2)throw Error('continuous actual source');
 const dx=Math.sign(end.x-start.x),dz=Math.sign(end.z-start.z);if(Math.abs(dx)+Math.abs(dz)!==1)throw Error('continuous straight axis');
 for(let i=1;i<points.length;i++){const q=points[i],prev=points[i-1];if(q.x-prev.x!==dx||q.z-prev.z!==dz||q.y>prev.y||prev.y-q.y>1||!full(q.offset(0,-1,0)))throw Error('continuous actual geometry '+q);for(const c of[q,q.offset(0,1,0),...(q.y<prev.y?[q.offset(0,2,0),q.offset(0,3,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(c)?.name))throw Error('continuous uncleared '+c);}
 const center=end.offset(.5,0,.5),began=Date.now(),samples=[],timeBudget=1500+Math.ceil((Math.abs(end.x-start.x)+Math.abs(end.z-start.z))/3*1000);let lastProgress=Date.now(),last=bot.entity.position.clone();
 await bot.lookAt(v(bot.entity.position.x+2*(center.x-bot.entity.position.x)/Math.max(.01,Math.hypot(center.x-bot.entity.position.x,center.z-bot.entity.position.z)),bot.entity.position.y-2,bot.entity.position.z+2*(center.z-bot.entity.position.z)/Math.max(.01,Math.hypot(center.x-bot.entity.position.x,center.z-bot.entity.position.z))),true);guard.escape('continuous looked');
 const remaining=()=>dx*(center.x-bot.entity.position.x)+dz*(center.z-bot.entity.position.z);
 bot.setControlState('forward',true);try{while(remaining()>.20&&Date.now()-began<timeBudget){await sleep(1);guard.escape('continuous walking');if(samples.length<16)samples.push({at:new Date().toISOString(),p:bot.entity.position.clone(),ground:bot.entity.onGround,hp:bot.health});if(bot.entity.position.distanceTo(last)>.08){last=bot.entity.position.clone();lastProgress=Date.now();}if(Date.now()-lastProgress>600)throw Error('continuous stalled');if(bot.entity.position.y<end.y-.1)throw Error('continuous fell below destination');}}finally{bot.clearControlStates();}
 for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-end.y)>.03);k++){await sleep(1);guard.escape('continuous final land');}await sleep(2);guard.escape('continuous final settled');
 console.log('CONTINUOUS_ACTUAL_LANDING',JSON.stringify({at:new Date().toISOString(),start,end,p:bot.entity.position,hp:bot.health,elapsedMs:Date.now()-began,samples}));
 if(!bot.entity.onGround||Math.abs(bot.entity.position.y-end.y)>.03||!bot.entity.position.floored().equals(end))throw Error('continuous final actual cell');
 if(bot.entity.position.distanceTo(center)>.22){await flat(center);guard.escape('continuous final recenter');}
 if(!bot.entity.onGround||bot.entity.position.distanceTo(center)>.25)throw Error('continuous final postcondition');
}
// Passive permitted public-state snapshots; no cause/phase inference or actions.
function makePlayerDamageEvidence(bot,getPhase=()=>'',limit=8){
 let previous=bot.health,done=false,dropped=0;const rows=[];
 const xyz=p=>p?{x:p.x,y:p.y,z:p.z}:null;
 const snapshot=(event,prior)=>{const p=bot.entity.position,q=p.floored();const entities=Object.values(bot.entities).filter(e=>['ender_dragon','dragon_fireball','area_effect_cloud','enderman'].includes(e.name)).map(e=>({id:e.id,name:e.name,p:xyz(e.position),velocity:xyz(e.velocity),width:e.width,height:e.height}));const row={at:new Date().toISOString(),event,phase:getPhase(),priorHp:prior,hp:bot.health,p:xyz(p),velocity:xyz(bot.entity.velocity),ground:bot.entity.onGround,eyeHeight:bot.entity.eyeHeight,feet:bot.blockAt(q)?.name,head:bot.blockAt(q.offset(0,1,0))?.name,floor:bot.blockAt(q.offset(0,-1,0))?.name,entities};if(rows.length>=limit){rows.shift();dropped++;}rows.push(row);};
 const health=()=>{if(bot.health<previous)snapshot('healthLoss',previous);previous=bot.health;};
 const hurt=e=>{if(e===bot.entity)snapshot('playerHurt',previous);};bot.on('health',health);bot.on('entityHurt',hurt);
 return{stop(){if(!done){bot.removeListener('health',health);bot.removeListener('entityHurt',hurt);done=true;}return{rows:[...rows],dropped,listenersRemoved:done,limits:'Retained actual state at events, not proof of damage cause or no-event safety.'};}};
}
if(bot.health!==10||bot.food!==16||count('snowball')!==1||count('sand')!==2||count('end_stone')!==203||bot.inventory.items().find(i=>i.name==='wooden_pickaxe')?.durabilityUsed!==39||!bot.entity.position.floored().equals(v(-11,50,-11))||!audit().every(x=>x.full))throw Error('LIVEexactwarm39sourcechanged');console.log('LIVE_BASE_ACTUAL_ADMISSION',JSON.stringify(state()));
const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now();let escaping=false,admitted=false,reached=false,hazard=false;const route=[v(-11,50,-11)];for(let x=-12;x>=-16;x--)route.push(v(x,50,-11));for(let k=1;k<=8;k++)route.push(v(-16-k,50+k,-11));const visited=[route[0]];const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazard=true;if(!escaping&&phase==='prepare'){bot.clearControlStates();try{const r=bot.stopDigging();if(r?.catch)r.catch(()=>{});}catch{}}}};let phase='prepare',surfaceStart=0;const damage=makePlayerDamageEvidence(bot,()=>phase);bot.on('entitySpawn',onSpawn);
function forward(l){if(escaping){guard.escape(l);return;}guard.forward(l);if(Object.values(bot.entities).some(e=>(e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7)||(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<6)))throw Error('actual close hazard '+l);if(phase==='prepare'&&hazard)throw Error('prepare fireball '+l);if(phase==='surface'&&Date.now()-surfaceStart>45000)throw Error('surface budget');if(Date.now()-began>240000)throw Error('whole forward budget');}
const walkCheck=l=>forward(l);
async function walkRoute(points){let i=0;while(i<points.length-1){const a=points[i],q=points[i+1];if(q.y>a.y){await stepStair(q);i++;continue;}const dx=q.x-a.x,dz=q.z-a.z;let j=i+1;while(j<points.length-1&&points[j+1].x-points[j].x===dx&&points[j+1].z-points[j].z===dz&&points[j+1].y<=points[j].y&&points[j].y-points[j+1].y<=1)j++;await continuousWalkSegment(points.slice(i,j+1),{escape:forward});i=j;}}
async function retreat(){escaping=true;guard.beginEscape('east surface retreat');const idx=await actualPreparedIndex(visited,guard);await walkRoute(visited.slice(0,idx+1).reverse());await flat(v(-10.5,50,-10.5));await seal(true);}
function surf(x,z){for(let y=63;y>=55;y--){const q=v(x,y,z);if(full(q.offset(0,-1,0))&&[q,q.offset(0,1,0),q.offset(0,2,0),q.offset(0,3,0)].every(c=>['air','cave_air'].includes(bot.blockAt(c)?.name)))return q;}throw Error('no actual clear natural surface '+x+','+z);}
try{
 if(bot.game.dimension!=='the_end'||bot.health!==10||count('snowball')!==1||!bot.entity.position.floored().equals(route[0])||!audit().every(a=>a.full))throw Error('east base source');admitted=true;console.log('BASE_SOURCE',JSON.stringify(state()));
 for(const q of route.slice(1)){await stepStair(q,true);for(const c of(q.y>bot.entity.position.y?[bot.entity.position.floored().offset(0,3,0),q.offset(0,2,0),q.offset(0,3,0)]:[]))if(!['air','cave_air'].includes(bot.blockAt(c)?.name)){await cut(c,['end_stone','basalt']);forward('west return headroom');}visited.push(q);await stepStair(q);}
 phase='surface';surfaceStart=Date.now();const points=[route.at(-1),surf(-25,-11)];for(let z=-12;z>=-25;z--)points.push(surf(-25,z));for(let x=-24;x<=30;x++)points.push(surf(x,-25));
 console.log('ACTUAL_SURFACE_ROUTE',JSON.stringify(points));let i=0;while(i<points.length-1){const a=points[i],q=points[i+1];if(q.y>a.y){visited.push(q);await stepStair(q);i++;continue;}const dx=q.x-a.x,dz=q.z-a.z;let j=i+1;while(j<points.length-1&&points[j+1].x-points[j].x===dx&&points[j+1].z-points[j].z===dz&&points[j+1].y<=points[j].y&&points[j].y-points[j+1].y<=1)j++;const leg=points.slice(i,j+1);for(const c of leg.slice(1))visited.push(c);await continuousWalkSegment(leg,{escape:forward});i=j;}
 reached=true;console.log('EAST_BASE_ACTUAL',JSON.stringify(state()));await flat(v(30.5,58,-24.5));await seal(true);console.log('EAST_BASE_RETAINED',JSON.stringify(state()));
}catch(e){console.log('FAILURE',String(e),JSON.stringify({state:state(),phase,reached}));if(admitted)try{await retreat();}catch(f){console.log('RECOVERY_FAILURE_IMMEDIATE',String(f),JSON.stringify(state()));try{await refuge();}catch(g){console.log('RECOVERY_FAILURE',String(g),JSON.stringify(state()));}}}
finally{console.log('PLAYER_DAMAGE_EVIDENCE',JSON.stringify(damage.stop()));console.log('BASE_POST',JSON.stringify({state:state(),reached,elapsedMs:Date.now()-began,preparedRoute:visited.map(q=>[q.x,q.y,q.z])}));bot.removeListener('entitySpawn',onSpawn);guard.close();console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();}return state();
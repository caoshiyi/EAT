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

// Ordinary continuous walking down a prepared, straight supported segment.
// No per-cell centering pause; retain final actual ground/Y/position checks.
async function continuousWalkSegment(points,guard){
 guard.escape('continuous segment start');const start=points[0],end=points.at(-1),a=bot.entity.position.floored();
 if(!a.equals(start)||!bot.entity.onGround||points.length<2)throw Error('continuous actual source');
 const dx=Math.sign(end.x-start.x),dz=Math.sign(end.z-start.z);if(Math.abs(dx)+Math.abs(dz)!==1)throw Error('continuous straight axis');
 for(let i=1;i<points.length;i++){const q=points[i],prev=points[i-1];if(q.x-prev.x!==dx||q.z-prev.z!==dz||q.y>prev.y||prev.y-q.y>1||!full(q.offset(0,-1,0)))throw Error('continuous actual geometry '+q);for(const c of[q,q.offset(0,1,0),...(q.y<prev.y?[q.offset(0,2,0),q.offset(0,3,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(c)?.name))throw Error('continuous uncleared '+c);}
 const center=end.offset(.5,0,.5),began=Date.now(),samples=[],timeBudget=1500+Math.ceil((Math.abs(end.x-start.x)+Math.abs(end.z-start.z))/3*1000);let lastProgress=Date.now(),last=bot.entity.position.clone();
 await bot.lookAt(v(center.x,bot.entity.position.y+bot.entity.eyeHeight,center.z),true);guard.escape('continuous looked');
 const remaining=()=>dx*(center.x-bot.entity.position.x)+dz*(center.z-bot.entity.position.z);
 bot.setControlState('forward',true);try{while(remaining()>.20&&Date.now()-began<timeBudget){await sleep(1);guard.escape('continuous walking');if(samples.length<16)samples.push({at:new Date().toISOString(),p:bot.entity.position.clone(),ground:bot.entity.onGround,hp:bot.health});if(bot.entity.position.distanceTo(last)>.08){last=bot.entity.position.clone();lastProgress=Date.now();}if(Date.now()-lastProgress>600)throw Error('continuous stalled');if(bot.entity.position.y<end.y-.1)throw Error('continuous fell below destination');}}finally{bot.clearControlStates();}
 for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-end.y)>.03);k++){await sleep(1);guard.escape('continuous final land');}await sleep(2);guard.escape('continuous final settled');
 console.log('CONTINUOUS_ACTUAL_LANDING',JSON.stringify({at:new Date().toISOString(),start,end,p:bot.entity.position,hp:bot.health,elapsedMs:Date.now()-began,samples}));
 if(!bot.entity.onGround||Math.abs(bot.entity.position.y-end.y)>.03||!bot.entity.position.floored().equals(end))throw Error('continuous final actual cell');
 if(bot.entity.position.distanceTo(center)>.22){await flat(center);guard.escape('continuous final recenter');}
 if(!bot.entity.onGround||bot.entity.position.distanceTo(center)>.25)throw Error('continuous final postcondition');
}

const route=[[5, 50, 0], [5, 50, 1], [5, 50, 2], [6, 50, 2], [7, 50, 2], [7, 50, 3], [8, 50, 3], [9, 50, 3], [10, 50, 3], [11, 50, 3], [12, 50, 3], [13, 50, 3], [14, 50, 3], [15, 50, 3], [16, 50, 3], [17, 50, 3], [18, 50, 3], [19, 50, 3], [20, 50, 3], [21, 50, 3], [22, 50, 3], [23, 50, 3], [24, 50, 3], [25, 50, 3], [26, 50, 3], [27, 50, 3], [28, 50, 3], [29, 50, 3], [30, 50, 3], [31, 50, 3], [32, 50, 3], [33, 50, 3], [34, 50, 3], [35, 50, 3], [36, 50, 3], [37, 50, 3], [38, 50, 3], [39, 50, 3], [40, 50, 3], [41, 50, 3], [42, 50, 3], [43, 50, 3], [44, 50, 3], [44, 50, 2], [45, 50, 2], [45, 50, 1], [45, 50, 0], [46, 50, 0], [47, 50, 0], [48, 50, 0], [49, 50, 0], [50, 50, 0], [51, 50, 0], [52, 50, 0], [53, 50, 0], [54, 50, 0], [55, 50, 0], [56, 50, 0], [57, 50, 0], [58, 50, 0], [59, 50, 0], [60, 50, 0], [61, 50, 0], [62, 50, 0], [63, 50, 0], [64, 50, 0], [65, 50, 0], [66, 50, 0], [67, 50, 0], [68, 50, 0], [69, 50, 0], [70, 50, 0], [71, 50, 0], [72, 50, 0], [73, 50, 0], [74, 50, 0], [75, 50, 0]].map(q=>v(...q));
console.log('ENVIRONMENT LIVE actual77node5→75 pickupqualification; model6visiblecuts mustactuallypass; whole03:07–03:10');
const guard=makeOperationGuard(bot),forward=l=>guard.forward(l);try{if(bot.game.dimension!=='the_end'||bot.health!==10||!bot.entity.position.floored().equals(route[0])||!audit().every(a=>a.full))throw Error('actualpickupsourcechanged');console.log('ACTUAL_PLATFORM_APPROACH_START',JSON.stringify(state()));let i=0;while(i<route.length-1){const dx=route[i+1].x-route[i].x,dz=route[i+1].z-route[i].z;let j=i;while(j<route.length-1&&route[j+1].x-route[j].x===dx&&route[j+1].z-route[j].z===dz&&[route[j+1],route[j+1].offset(0,1,0)].every(q=>['air','cave_air'].includes(bot.blockAt(q)?.name))&&full(route[j+1].offset(0,-1,0)))j++;if(j>i){await continuousWalkSegment(route.slice(i,j+1),{escape:forward});i=j;}else{await stepStair(route[i+1]);i++;}}
await flat(route.at(-1).offset(.5,0,.5));await seal(true);console.log('ACTUAL_75_PICKUP_ROUTE_ADOPTED',JSON.stringify({state:state(),faces:audit(),scope:'actual5→75 route77nodes,6oractualvisiblecuts, allnormalcontrols; OWtransit notqualified'}));}
catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));try{await flat(bot.entity.position.floored().offset(.5,0,.5));await seal(true);}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}
finally{console.log('ACTUAL_75_ROUTE_POST',JSON.stringify({state:state(),faces:audit()}));guard.close();stop();}return state();

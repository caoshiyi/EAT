async function walkLow(points,startIndex,endIndex,budgetMs=85000){
const initialHP=bot.health;const began=Date.now();let cursor=startIndex,stalls=0,pauses=0;
if(!bot.entity.position.floored().equals(v(...points[cursor]))||bot.game.dimension!=='the_end')throw Error('LOW source admission');
const allowed=['end_stone','basalt','blackstone','netherrack','dirt','cobblestone','nether_bricks','cobbled_deepslate','tuff','stone','stone_bricks','cracked_stone_bricks','mossy_stone_bricks','deepslate','diorite','granite','andesite'];
while(cursor<endIndex){alive();if(Date.now()-began>budgetMs)throw Error('LOW whole caller budget');let goalIndex=Math.min(cursor+20,endIndex);let cleared=0;const firstDir=[points[cursor+1][0]-points[cursor][0],points[cursor+1][2]-points[cursor][2]];for(let j=cursor+2;j<=goalIndex;j++)if(points[j][0]-points[j-1][0]!==firstDir[0]||points[j][2]-points[j-1][2]!==firstDir[1]){goalIndex=j-1;break;}
for(let j=cursor+1;j<=goalIndex;j++){const q=v(...points[j]),floor=bot.blockAt(q.offset(0,-1,0));if(!full(q.offset(0,-1,0))||['magma_block','lava','water'].includes(floor?.name))throw Error('LOW floor preflight '+q+' '+floor?.name);for(const d of [[0,0,0],[0,1,0]])if(['lava','water','fire','soul_fire','magma_block'].includes(bot.blockAt(q.offset(...d))?.name))throw Error('LOW body hazard '+q.offset(...d));}
for(let j=cursor+1;j<=goalIndex;j++){const q=v(...points[j]);if(bot.entity.position.distanceTo(q.offset(.5,0,.5))>3.1)continue;for(const b of [q.offset(0,1,0),q])if(full(b)){await cut(b,allowed);cleared++;}}
for(let j=cursor+1;j<=goalIndex;j++){const q=v(...points[j]);if(full(q)||full(q.offset(0,1,0))){goalIndex=j-1;break;}}if(goalIndex<=cursor)throw Error('LOW nearest obstacle not cleared; fresh visible stance required');const oldCursor=cursor;
try{await travel(v(...points[goalIndex]),14000,0,false);await flat(v(...points[goalIndex]).offset(.5,0,.5));cursor=goalIndex;stalls=0;console.log('LOW_CHUNK_ACTUAL',JSON.stringify({cursor,goal:points[cursor],cleared,state:state()}));}
catch(e){if(bot.health<initialHP||bot.game.dimension!=='the_end'||bot.health<=0)throw e;pauses++;console.log('LOW_NATIVE_ATTEMPT_PAUSED',JSON.stringify({attemptCompleted:false,error:String(e),guideFrom:cursor,guideGoal:goalIndex,actual:state()}));let best=-1,bestDist=Infinity;for(let j=cursor;j<=goalIndex;j++){const d=bot.entity.position.distanceTo(v(...points[j]).offset(.5,0,.5));if(d<bestDist){bestDist=d;best=j;}}if(bestDist>1.6)throw Error('LOW left known guide '+bestDist);if(!bot.entity.position.floored().equals(v(...points[best])))await travel(v(...points[best]),4000,0,false);cursor=best;if(cursor<=oldCursor&&cleared===0)stalls++;else stalls=0;if(stalls>=2)throw Error('LOW two unchanged pauses; fresh method required');}
}
if(!bot.entity.position.floored().equals(v(...points[endIndex])))throw Error('LOW terminal exact goal absent');await flat(v(...points[endIndex]).offset(.5,0,.5));console.log('LOW_OPERATION_COMPLETE',JSON.stringify({startIndex,endIndex,pauses,ms:Date.now()-began,state:state()}));
}

const END_PATH=[[75, 50, 0], [74, 50, 0], [73, 50, 0], [72, 50, 0], [71, 50, 0], [70, 50, 0], [69, 50, 0], [68, 50, 0], [67, 50, 0], [66, 50, 0], [65, 50, 0], [64, 50, 0], [63, 50, 0], [62, 50, 0], [61, 50, 0], [60, 50, 0], [59, 50, 0], [58, 50, 0], [57, 50, 0], [56, 50, 0], [55, 50, 0], [54, 50, 0], [53, 50, 0], [52, 50, 0], [51, 50, 0], [50, 50, 0], [49, 50, 0], [48, 50, 0], [47, 50, 0], [46, 50, 0], [45, 50, 0], [45, 50, 1], [45, 50, 2], [44, 50, 2], [44, 50, 3], [43, 50, 3], [42, 50, 3], [41, 50, 3], [40, 50, 3], [39, 50, 3], [38, 50, 3], [37, 50, 3], [36, 50, 3], [35, 50, 3], [34, 50, 3], [33, 50, 3], [32, 50, 3], [31, 50, 3], [30, 50, 3], [29, 50, 3], [28, 50, 3], [27, 50, 3], [26, 50, 3], [25, 50, 3], [24, 50, 3], [23, 50, 3], [22, 50, 3], [21, 50, 3], [20, 50, 3], [19, 50, 3], [18, 50, 3], [17, 50, 3], [16, 50, 3], [15, 50, 3], [14, 50, 3], [13, 50, 3], [12, 50, 3], [11, 50, 3], [10, 50, 3], [9, 50, 3], [8, 50, 3], [7, 50, 3], [6, 50, 3], [5, 50, 3], [5, 50, 2], [5, 50, 1], [5, 50, 0]];
// Function only: owner includes/calls after own small harvest/stance qualification.
// UNEXECUTED. Public Mineflayer API; no assumed projectile physics or proxy entities.
async function observeOneSnowball({aim, targetCrystalId=null, maxTicks=80}) {
  const V=bot.entity.position.constructor;
  aim=new V(aim.x,aim.y,aim.z);
  const count=()=>bot.inventory.items().filter(i=>i.name==='snowball').reduce((n,i)=>n+i.count,0);
  const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dimension:bot.game.dimension,ground:bot.entity.onGround,inventorySnowballs:count(),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),goal:!!bot.pathfinder.goal,window:!!bot.currentWindow});
  const before=state(),startPos=bot.entity.position.clone(),dim=bot.game.dimension;
  if(!before.ground||before.hp<=0||before.goal||before.window||Object.values(before.controls).some(Boolean)||count()<1) throw Error('projectile admission: need alive idle supported funded stance');
  const target=targetCrystalId===null?null:bot.entities[targetCrystalId];
  if(targetCrystalId!==null&&target?.name!=='end_crystal') throw Error('need current actual end_crystal, not proxy');
  if(target&&aim.distanceTo(target.position.offset(0,.65,0))>.05) throw Error('owner must aim at observed crystal +.65, not stale coordinates');
  await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');
  await bot.lookAt(aim,true); await bot.waitForTicks(2);
  const rays=[bot.entity.eyeHeight,1.8].map(h=>{const eye=bot.entity.position.offset(0,h,0),d=aim.minus(eye),hit=bot.world.raycast(eye,d.scaled(1/d.norm()),Math.max(.01,d.norm()-.02));return {h,d:d.norm(),hit:hit?{p:hit.position,n:hit.name}:null};});
  // Local smoke may aim at the visible wall itself; no intervening block is allowed.
  if(rays.some(r=>r.hit&&(!target&&r.hit.p.equals(aim.floored())?false:true))) throw Error('projectile aim is occluded '+JSON.stringify(rays));
  const ids=new Set(Object.keys(bot.entities).map(Number)),tracks=new Map(),events=[];
  const snapshot=e=>({id:e.id,name:e.name,type:e.type,p:e.position?.clone(),velocity:e.velocity?.clone()});
  const spawn=e=>{if(e.position?.distanceTo(startPos)<8) events.push({kind:'spawn',at:new Date().toISOString(),entity:snapshot(e)});if(e.name==='snowball'&&!ids.has(e.id))tracks.set(e.id,[]);};
  const gone=e=>{if(tracks.has(e.id)||e.id===targetCrystalId)events.push({kind:'gone',at:new Date().toISOString(),entity:snapshot(e)});};
  bot.on('entitySpawn',spawn);bot.on('entityGone',gone);
  let failure=null;
  try {
    console.log('PROJECTILE_PRE',JSON.stringify({before,aim,target:target?snapshot(target):null,rays}));
    bot.activateItem();await bot.waitForTicks(1);bot.deactivateItem();
    for(let tick=0;tick<maxTicks;tick++){
      if(bot.health<=0||bot.game.dimension!==dim||bot.entity.position.distanceTo(startPos)>.25)throw Error('projectile trial life/dimension/stance changed');
      for(const e of Object.values(bot.entities))if(e.name==='snowball'&&!ids.has(e.id)){
        if(!tracks.has(e.id))tracks.set(e.id,[]);
        if(tick%2===0)tracks.get(e.id).push({tick,at:new Date().toISOString(),...snapshot(e),targetDistance:target?e.position.distanceTo(target.position):null});
      }
      await bot.waitForTicks(1);
    }
  } catch(e){failure=String(e);}
  finally {bot.deactivateItem();bot.removeListener('entitySpawn',spawn);bot.removeListener('entityGone',gone);}
  const after=state(),result={before,after,inventoryDelta:after.inventorySnowballs-before.inventorySnowballs,events,tracks:[...tracks].map(([id,samples])=>({id,samples})),targetPresent:targetCrystalId===null?null:!!bot.entities[targetCrystalId],currentCrystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(snapshot),failure};
  console.log('PROJECTILE_POST',JSON.stringify(result));
  // Caller owns actual shelter/retreat, additional absence samples and live evaluator.
  return result;
}

// Public API observer only. Include before End entry when possible; owner supplies one legally qualified action.
// No attacks, movement, fabricated parts, or reach/visibility decisions are made here.
function makeDragonContactObserver() {
  const now=()=>new Date().toISOString(),bindings=[],events=[],bars=new Map();let droppedEvents=0,stopped=false;
  const point=p=>p?{x:p.x,y:p.y,z:p.z}:null;
  const entity=e=>e?{id:e.id,name:e.name,type:e.type,p:point(e.position),width:e.width,height:e.height}:null;
  const relevant=e=>e&&(e.name==='ender_dragon'||e.name==='end_crystal');
  const record=r=>{if(events.length<200)events.push(r);else droppedEvents++;};
  const bind=(n,f)=>{bot.on(n,f);bindings.push([n,f]);};
  for(const name of ['bossBarCreated','bossBarUpdated','bossBarDeleted'])bind(name,b=>{const row={at:now(),event:name,title:b.title?.toString(),fraction:b.health,isDragonBar:b.isDragonBar,uuid:b.entityUUID};bars.set(String(b.entityUUID),row);record(row);});
  for(const name of ['entityHurt','entityDead','entityGone','entitySpawn'])bind(name,e=>{if(relevant(e))record({at:now(),event:name,entity:entity(e)});});
  bind('health',()=>record({at:now(),event:'playerHealth',hp:bot.health,food:bot.food}));
  bind('death',()=>record({at:now(),event:'playerDeath',p:point(bot.entity?.position)}));
  const snapshot=()=>({at:now(),dimension:bot.game.dimension,p:point(bot.entity.position),hp:bot.health,food:bot.food,ground:bot.entity.onGround,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),goal:!!bot.pathfinder.goal,window:!!bot.currentWindow,cursorEntity:entity(bot.entityAtCursor(3.5)),entities:Object.values(bot.entities).filter(relevant).map(entity),lastObservedBossBars:[...bars.values()]});
  return {
    snapshot,
    stop(){if(!stopped){for(const[n,f]of bindings)bot.removeListener(n,f);stopped=true;}return{events:[...events],droppedEvents,bars:[...bars.values()]};},
    async oneAction(action,maxTicks=60){
      if(stopped)throw Error('observer stopped');
      const before=snapshot(),body=bot.entity;
      if(before.dimension!=='the_end'||!before.entities.some(e=>e.name==='ender_dragon'))throw Error('contact admission: no current real End dragon; action NOT called');
      if(!before.ground||before.hp<=0||before.goal||before.window||Object.values(before.controls).some(Boolean)||typeof action!=='function'||maxTicks<1||maxTicks>80)throw Error('contact admission: need alive idle supported stance, one owner action, <=80ticks');
      const eventStart=events.length,timeline=[];let actionError=null,observationError=null,actionReturned=false;
      console.log('CONTACT_PRE',JSON.stringify({before,note:'Owner separately qualifies current visibility/reach/action. LastObservedBossBars may be empty if attached after entry.'}));
      try{try{await action();actionReturned=true;}catch(e){actionError=String(e);}
        for(let tick=0;tick<maxTicks;tick++){if(tick%2===0)timeline.push({tick,...snapshot()});if(bot.entity!==body||bot.health<=0||bot.game.dimension!=='the_end'){observationError='life/dimension changed';break;}await bot.waitForTicks(1);}
      }catch(e){observationError=String(e);}
      const result={before,after:snapshot(),actionReturned,actionError,observationError,timeline,events:events.slice(eventStart),droppedEvents,note:'Returned action is not proof of hit; lack of observed damage is not immunity proof. Caller owns actual retreat/ending/evaluator.'};
      console.log('CONTACT_POST',JSON.stringify(result));return result;
    }
  };
}

const base=v(5,57,3),top=v(5,60,3);let softReady=false,opened=false;const o=makeDragonContactObserver();
async function fastDrop(){bot.pathfinder.setGoal(null);bot.clearControlStates();alive();for(const y of [59,58,57]){const q=v(5,y,3),b=bot.blockAt(q);if(['air','cave_air'].includes(b?.name))continue;if(!['sand','sandstone'].includes(b?.name))throw Error('emergency actual material '+b?.name);const item=bot.inventory.items().find(i=>i.name===(b.name==='sand'?'stone_shovel':'stone_pickaxe'));await bot.equip(item,'hand');await face(q);await bot.dig(bot.blockAt(q),false,'raycast');await sleep(1);if(full(q))throw Error('emergency cut postcondition');}await sleep(16);console.log('EMERGENCY_DROP_ACTUAL',JSON.stringify(state()));if(!bot.entity.onGround||Math.abs(bot.entity.position.y-57)>.03)throw Error('emergency landing absent');await sleep(10);if(!full(v(6,57,3))){if(!full(v(5,55,3)))throw Error('repair lower support absent');await cut(v(5,56,3),['basalt']);await sleep(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-56)>.03)throw Error('repair DOWN1 absent');await put(v(6,57,3),'basalt');await pillar('basalt');console.log('LOWER_FOOT_REPAIRED',JSON.stringify(state()));}await put(v(5,59,3),'end_stone');await seal();}
async function endRoof(q){const roof=q.offset(0,2,0);if(full(roof))return;try{await put(roof,'end_stone');return;}catch(e){}for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){const ref=q.offset(d[0],1,d[2]),third=ref.offset(0,1,0);if(!full(ref)||bot.blockAt(third)?.name!=='air')continue;await bot.equip(bot.inventory.items().find(i=>i.name==='basalt'),'hand');bot.setControlState('jump',true);try{for(let k=0;k<15&&bot.entity.position.y<q.y+.65;k++)await sleep(1);await face(ref,1);await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}await sleep(14);await put(roof,'end_stone');return;}throw Error('Endstone roof anchor unavailable');}
try{if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(75,50,0))||bot.health<16)throw Error('contact source admission');await walkLow(END_PATH,0,END_PATH.length-4,85000);await seal();while(bot.entity.position.y<56.99){const roof=bot.entity.position.floored().offset(0,2,0);if(full(roof))await cut(roof,['end_stone','basalt']);await pillar('basalt');}await seal();console.log('LIVE_CONTACT_COLUMN',JSON.stringify(state()));
if(!full(v(6,57,3))){if(!full(v(5,55,3)))throw Error('repair lower support absent');await cut(v(5,56,3),['basalt']);await sleep(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-56)>.03)throw Error('repair DOWN1 absent');await put(v(6,57,3),'basalt');await pillar('basalt');console.log('LOWER_FOOT_REPAIRED',JSON.stringify(state()));}
// Changed trial: mixed-stone cover; no additional room-wall harvesting.
const ownRoof=base.offset(0,2,0);if(full(ownRoof))await cut(ownRoof,['end_stone','basalt']);
for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){const target=base.offset(d[0],2,d[2]);if(full(target))continue;const ref=target.offset(0,-1,0);if(!full(ref))throw Error('actual head support absent '+ref);await bot.equip(bot.inventory.items().find(i=>i.name==='basalt'),'hand');bot.setControlState('jump',true);try{for(let k=0;k<15&&bot.entity.position.y<base.y+.65;k++)await sleep(1);await face(ref,1);await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}await sleep(14);if(!full(target))throw Error('prepared support absent');}
for(const name of ['sandstone','sand','sand']){const roof=bot.entity.position.floored().offset(0,2,0);if(full(roof))await cut(roof,['end_stone']);await pillar(name);}softReady=true;
for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[1,1,0],[-1,1,0],[0,1,1],[0,1,-1]])if(!full(top.offset(...d)))await put(top.offset(...d),'basalt');await endRoof(top);await seal();console.log('CONTACT_CAPSULE_RETAINED',JSON.stringify(state()));

const targets=Object.values(bot.entities).filter(e=>e.name==='end_crystal').sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position));if(!targets.length)throw Error('no actual crystals');let target=null,aim=null;const cuts=[];
try{for(const trial of targets){const point=trial.position.offset(0,.65,0);for(let attempt=0;attempt<4;attempt++){const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),delta=point.minus(eye),hit=bot.world.raycast(eye,delta.scaled(1/delta.norm()),delta.norm()-.02);if(!hit)break;const q=hit.position;if(!((q.equals(top.offset(0,2,0)))||([61,62].includes(q.y)&&Math.abs(q.x-5)+Math.abs(q.z-3)===1))){console.log('CRYSTAL_EXTERNAL_OCCLUSION',trial.id,q,hit.name);break;}const old=bot.blockAt(q)?.name;if(!['basalt','end_stone'].includes(old))break;await cut(q,[old]);cuts.push({q,name:old});}
const clear=[bot.entity.eyeHeight,1.8].every(h=>{const eye=bot.entity.position.offset(0,h,0),delta=point.minus(eye);return !bot.world.raycast(eye,delta.scaled(1/delta.norm()),delta.norm()-.02);});if(clear){target=trial;aim=point;break;}}
if(!target)throw Error('no actually clear current crystal after bounded owned-aperture cuts');
console.log('ONE_ACTUAL_CRYSTAL_TARGET',JSON.stringify({id:target.id,p:target.position,state:state()}));await observeOneSnowball({aim,targetCrystalId:target.id,maxTicks:80});
}catch(e){console.log('SNOW_FORWARD_FAILURE',String(e));throw e;}finally{try{for(const x of cuts.reverse())if(x.q.y===61)await put(x.q,x.name);await endRoof(top);}finally{await fastDrop();}}

}catch(e){console.log('CONTACT_CAPSULE_FAILURE',String(e),JSON.stringify(state()));try{if(opened&&bot.health>0)await put(top.offset(0,2,0),'end_stone');if(softReady&&bot.entity.position.y>59.9)await fastDrop();else await seal();}catch(f){console.log('CONTACT_CAPSULE_ENDING_FAILURE',String(f),JSON.stringify(state()));}}finally{console.log('CONTACT_PUBLIC_EVENTS',JSON.stringify(o.stop()));stop();}return state();

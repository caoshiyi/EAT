async function walkLow(points,startIndex,endIndex,budgetMs=85000){
const began=Date.now();let cursor=startIndex,stalls=0,pauses=0;
if(!bot.entity.position.floored().equals(v(...points[cursor]))||bot.game.dimension!=='overworld')throw Error('LOW source admission');
const allowed=['basalt','blackstone','netherrack','dirt','cobblestone','nether_bricks','cobbled_deepslate','tuff','stone','stone_bricks','cracked_stone_bricks','mossy_stone_bricks','deepslate','diorite','granite','andesite'];
while(cursor<endIndex){alive();if(Date.now()-began>budgetMs)throw Error('LOW whole caller budget');let goalIndex=Math.min(cursor+20,endIndex);let cleared=0;const firstDir=[points[cursor+1][0]-points[cursor][0],points[cursor+1][2]-points[cursor][2]];for(let j=cursor+2;j<=goalIndex;j++)if(points[j][0]-points[j-1][0]!==firstDir[0]||points[j][2]-points[j-1][2]!==firstDir[1]){goalIndex=j-1;break;}
for(let j=cursor+1;j<=goalIndex;j++){const q=v(...points[j]),floor=bot.blockAt(q.offset(0,-1,0));if(!full(q.offset(0,-1,0))||['magma_block','lava','water'].includes(floor?.name))throw Error('LOW floor preflight '+q+' '+floor?.name);for(const d of [[0,0,0],[0,1,0]])if(['lava','water','fire','soul_fire','magma_block'].includes(bot.blockAt(q.offset(...d))?.name))throw Error('LOW body hazard '+q.offset(...d));}
for(let j=cursor+1;j<=goalIndex;j++){const q=v(...points[j]);if(bot.entity.position.distanceTo(q.offset(.5,0,.5))>3.1)continue;for(const b of [q.offset(0,1,0),q])if(full(b)){await cut(b,allowed);cleared++;}}
for(let j=cursor+1;j<=goalIndex;j++){const q=v(...points[j]);if(full(q)||full(q.offset(0,1,0))){goalIndex=j-1;break;}}if(goalIndex<=cursor)throw Error('LOW nearest obstacle not cleared; fresh visible stance required');const oldCursor=cursor;
try{await travel(v(...points[goalIndex]),14000,0,false);await flat(v(...points[goalIndex]).offset(.5,0,.5));cursor=goalIndex;stalls=0;console.log('LOW_CHUNK_ACTUAL',JSON.stringify({cursor,goal:points[cursor],cleared,state:state()}));}
catch(e){pauses++;console.log('LOW_NATIVE_ATTEMPT_PAUSED',JSON.stringify({attemptCompleted:false,error:String(e),guideFrom:cursor,guideGoal:goalIndex,actual:state()}));let best=-1,bestDist=Infinity;for(let j=cursor;j<=goalIndex;j++){const d=bot.entity.position.distanceTo(v(...points[j]).offset(.5,0,.5));if(d<bestDist){bestDist=d;best=j;}}if(bestDist>1.6)throw Error('LOW left known guide '+bestDist);if(!bot.entity.position.floored().equals(v(...points[best])))await travel(v(...points[best]),4000,0,false);cursor=best;if(cursor<=oldCursor&&cleared===0)stalls++;else stalls=0;if(stalls>=2)throw Error('LOW two unchanged pauses; fresh method required');}
}
if(!bot.entity.position.floored().equals(v(...points[endIndex])))throw Error('LOW terminal exact goal absent');await flat(v(...points[endIndex]).offset(.5,0,.5));console.log('LOW_OPERATION_COMPLETE',JSON.stringify({startIndex,endIndex,pauses,ms:Date.now()-began,state:state()}));
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

const OWL_POINTS=[[148, -39, 2242], [148, -39, 2243], [148, -39, 2244], [148, -39, 2245], [148, -39, 2246], [149, -39, 2246], [149, -39, 2247], [149, -39, 2248], [149, -39, 2249], [149, -39, 2250], [149, -39, 2251], [148, -39, 2251], [148, -39, 2252], [148, -39, 2253], [148, -39, 2254], [148, -39, 2255], [148, -39, 2256], [148, -39, 2257], [148, -39, 2258], [148, -39, 2259], [148, -39, 2260], [148, -39, 2261], [148, -39, 2262], [148, -39, 2263], [148, -39, 2264], [148, -39, 2265], [148, -39, 2266], [148, -39, 2267], [148, -39, 2268], [147, -39, 2268], [146, -39, 2268], [145, -39, 2268], [145, -39, 2269], [144, -39, 2269], [144, -39, 2270], [144, -39, 2271], [143, -39, 2271], [142, -39, 2271], [141, -39, 2271], [140, -39, 2271]];const o=makeDragonContactObserver();
try{if(bot.game.dimension!=='overworld'||!bot.entity.position.floored().equals(v(163,-26,2232))||bot.health<18)throw Error('LIVE OWL source admission');await travel(v(151,-26,2242),65000,0,true);await flat(v(151,-26,2242).offset(.5,0,.5));
for(let y=-40;y<=-27;y++){const q=v(151,y,2242);if(!full(q)||['lava','water','magma_block','gravel','sand','infested_stone_bricks'].includes(bot.blockAt(q)?.name))throw Error('LIVE shaft premise '+q);}
while(bot.entity.position.y>-38.99){const a=bot.entity.position.floored(),f=a.offset(0,-1,0);if(bot.health<18||!full(f.offset(0,-1,0)))throw Error('LIVE down health/support');await cut(f,['deepslate','basalt','mossy_stone_bricks','cracked_stone_bricks']);await sleep(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y+1)>.03)throw Error('LIVE actualDOWN1');console.log('LIVE_OWL_DOWN1',JSON.stringify(state()));}
await travel(v(148,-39,2242),15000,0,true);await flat(v(148,-39,2242).offset(.5,0,.5));await walkLow(OWL_POINTS,0,OWL_POINTS.length-1,65000);console.log('LIVE_OWL_LOWER_FRONT',JSON.stringify(state()));await travel(v(139,-39,2271),5000,0,true);await travel(v(138,-40,2271),5000,0,false);await travel(v(134,-38,2272),8000,0,false);await travel(v(134,-37,2273),5000,0,false);
await bot.lookAt(v(134.5,bot.entity.position.y+bot.entity.eyeHeight,2276.5),true);bot.setControlState('forward',true);try{for(let i=0;i<40&&bot.game.dimension==='overworld';i++){await sleep(1);alive();}}finally{bot.clearControlStates();}await sleep(20);if(bot.game.dimension!=='the_end')throw Error('no actual End receipt');console.log('LIVE_ACTUAL_END_ENTRY',JSON.stringify({state:state(),observer:o.snapshot()}));
for(let x=97;x>=75;x--)if(!full(v(x,49,0)))throw Error('bridge floor absent '+x);await travel(v(75,50,0),20000,0,true);await flat(v(75,50,0).offset(.5,0,.5));await seal();console.log('LIVE_PROTECTED_END_SOURCE',JSON.stringify({state:state(),observer:o.snapshot()}));
console.log('FOUNTAIN_BEDROCK',JSON.stringify(bot.findBlocks({matching:bot.registry.blocksByName.bedrock.id,maxDistance:128,count:128}).filter(q=>q.x*q.x+q.z*q.z<64)));for(const [x,z]of [[0,0],[3,0],[5,0],[8,0],[12,0]]){let a=[];for(let y=45;y<=75;y++)a.push([y,bot.blockAt(v(x,y,z))?.name]);console.log('CENTER_COLUMN',x,z,JSON.stringify(a));}
}catch(e){console.log('LIVE_END_LOWER_FAILURE',String(e),JSON.stringify(state()));try{await refuge();}catch(f){console.log('LIVE_END_LOWER_RETENTION_FAILURE',String(f),JSON.stringify(state()));}}finally{console.log('PUBLIC_END_EVENTS',JSON.stringify(o.stop()));stop();}return state();

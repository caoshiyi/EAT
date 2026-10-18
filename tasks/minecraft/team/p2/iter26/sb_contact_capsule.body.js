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
async function fastDrop(){bot.pathfinder.setGoal(null);bot.clearControlStates();alive();for(const y of [59,58,57]){const q=v(5,y,3),b=bot.blockAt(q);if(['air','cave_air'].includes(b?.name))continue;if(!['sand','sandstone'].includes(b?.name))throw Error('emergency actual material '+b?.name);const item=bot.inventory.items().find(i=>i.name===(b.name==='sand'?'stone_shovel':'stone_pickaxe'));await bot.equip(item,'hand');await face(q);await bot.dig(bot.blockAt(q),false,'raycast');await sleep(1);if(full(q))throw Error('emergency cut postcondition');}await sleep(16);console.log('EMERGENCY_DROP_ACTUAL',JSON.stringify(state()));if(!bot.entity.onGround||Math.abs(bot.entity.position.y-57)>.03)throw Error('emergency landing absent');await sleep(10);await put(v(5,59,3),'end_stone');await seal();}
async function endRoof(q){const roof=q.offset(0,2,0);if(full(roof))return;try{await put(roof,'end_stone');return;}catch(e){}for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){const ref=q.offset(d[0],1,d[2]),third=ref.offset(0,1,0);if(!full(ref)||bot.blockAt(third)?.name!=='air')continue;await bot.equip(bot.inventory.items().find(i=>i.name==='end_stone'),'hand');bot.setControlState('jump',true);try{for(let k=0;k<15&&bot.entity.position.y<q.y+.65;k++)await sleep(1);await face(ref,1);await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}await sleep(14);await put(roof,'end_stone');return;}throw Error('Endstone roof anchor unavailable');}
try{if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(5,50,3))||bot.health<16)throw Error('contact source admission');
while(bot.entity.position.y<56.99){const roof=bot.entity.position.floored().offset(0,2,0);if(full(roof))await cut(roof,['end_stone','basalt']);await pillar('basalt');}
for(const d of [[1,-1,0],[-1,-1,0],[0,-1,1],[0,-1,-1]])if(!full(top.offset(...d)))throw Error('capsule floor premise');
const extra=v(6,58,3);if(bot.blockAt(extra)?.name==='end_stone'){await cut(extra,['end_stone']);await sleep(10);await put(extra,'basalt');}
for(const name of ['sandstone','sand','sand']){const roof=bot.entity.position.floored().offset(0,2,0);if(full(roof))await cut(roof,['end_stone']);await pillar(name);}softReady=true;
for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[1,1,0],[-1,1,0],[0,1,1],[0,1,-1]])if(!full(top.offset(...d)))await put(top.offset(...d),'end_stone');await endRoof(top);await seal();console.log('CONTACT_CAPSULE_RETAINED',JSON.stringify(state()));
let candidate=null;const start=Date.now();while(Date.now()-start<45000){alive();if(bot.health<15)throw Error('capsule actual HP stop');candidate=Object.values(bot.entities).find(e=>e.name==='ender_dragon'&&Math.hypot(e.position.x,e.position.z)<5&&e.position.y<=65);if(candidate)break;await sleep(2);}if(!candidate)throw Error('bounded actual perch notobserved');
console.log('ACTUAL_NEAR_DRAGON',candidate.id,candidate.position,candidate.width,candidate.height);await cut(top.offset(0,2,0),['end_stone']);opened=true;await bot.equip(bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');const aim=candidate.position.offset(0,candidate.height*.5,0);await bot.lookAt(aim,true);const cursor=bot.entityAtCursor(3),eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),dir=aim.minus(eye).normalize();const hits=[bot.entity.eyeHeight,1.8].map(h=>bot.world.raycast(bot.entity.position.offset(0,h,0),dir,3));console.log('CONTACT_LEGAL_ADMISSION',JSON.stringify({cursor:cursor?.id,target:candidate.id,aim,hits:hits.map(h=>h?.position),state:state()}));if(cursor?.id!==candidate.id||hits.some(Boolean))throw Error('no current visible realDragon in3blockcursor');
await o.oneAction(async()=>{try{await bot.attack(candidate);console.log('ORDINARY_REAL_DRAGON_ATTACK_RETURNED',candidate.id);}finally{try{await put(top.offset(0,2,0),'end_stone');opened=false;}finally{await fastDrop();}}},20);
}catch(e){console.log('CONTACT_CAPSULE_FAILURE',String(e),JSON.stringify(state()));try{if(opened&&bot.health>0)await put(top.offset(0,2,0),'end_stone');if(softReady&&bot.entity.position.y>59.9)await fastDrop();else await seal();}catch(f){console.log('CONTACT_CAPSULE_ENDING_FAILURE',String(f),JSON.stringify(state()));}}finally{console.log('CONTACT_PUBLIC_EVENTS',JSON.stringify(o.stop()));stop();}return state();

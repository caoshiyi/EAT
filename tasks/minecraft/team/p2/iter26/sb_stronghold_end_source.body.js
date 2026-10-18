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

const contactObserver=makeDragonContactObserver();
try{if(bot.game.dimension!=='overworld'||bot.health<18||!bot.entity.position.floored().equals(v(163,-26,2232)))throw Error('SBstronghold source admission');
await travel(v(134,-38,2272),35000,0,true);console.log('PORTAL_FRONT_ACTUAL',JSON.stringify(state()));await travel(v(134,-37,2273),6000,0,false);const t=Date.now();await bot.lookAt(v(134.5,bot.entity.position.y+bot.entity.eyeHeight,2276.5),true);bot.setControlState('forward',true);try{for(let i=0;i<40&&bot.game.dimension==='overworld';i++){await sleep(1);alive();if(bot.health<12)throw Error('entry forward HP stop');}}finally{bot.clearControlStates();}await sleep(20);if(bot.game.dimension!=='the_end')throw Error('no actualEndreceipt');console.log('SB_END_RECEIPT',JSON.stringify({state:state(),observer:contactObserver.snapshot()}));
for(let x=97;x>=75;x--){const q=v(x,50,0);if(!full(q.offset(0,-1,0)))throw Error('actualEndbridge floor absent '+q);}
await travel(v(75,50,0),16000,0,true);await flat(v(75,50,0).offset(.5,0,.5));await seal();console.log('SB_END_PROTECTED_SOURCE',JSON.stringify({state:state(),observer:contactObserver.snapshot()}));
const bedrock=bot.findBlocks({matching:bot.registry.blocksByName.bedrock.id,maxDistance:128,count:128});console.log('FOUNTAIN_BEDROCK',JSON.stringify(bedrock.filter(q=>q.x*q.x+q.z*q.z<64)));for(const [x,z] of [[0,0],[0,3],[3,0],[5,0],[8,0],[12,0]]){let rows=[];for(let y=45;y<=75;y++)rows.push([y,bot.blockAt(v(x,y,z))?.name]);console.log('CENTER_COLUMN',x,z,JSON.stringify(rows));}
}catch(e){console.log('SB_END_ACCESS_FAILURE',String(e),JSON.stringify(state()));try{if(bot.entity.onGround&&!['nether_portal','end_portal'].includes(bot.blockAt(bot.entity.position.floored())?.name))await refuge();}catch(f){console.log('SB_END_ACCESS_RETENTION_FAILURE',String(f),JSON.stringify(state()));}}finally{console.log('PUBLIC_END_OBSERVER',JSON.stringify(contactObserver.stop()));stop();}return state();

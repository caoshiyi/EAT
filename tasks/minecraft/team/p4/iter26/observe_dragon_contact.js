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

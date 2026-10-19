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
const names=['health','death','entitySpawn','entityGone','entityHurt','physicsTick'];
const counts=()=>names.map(n=>[n,bot.listenerCount(n)]);
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dimension:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(n=>[n,bot.getControlState(n)])),goal:!!bot.pathfinder.goal});
const before=state(),listenerBefore=counts(),trace=makeHazardRecorder(bot);let out;
try{trace.mark('readOnlySmoke');await bot.waitForTicks(12);}finally{out=trace.stop();}
console.log('RECORDER_SMOKE',JSON.stringify({before,after:state(),listenerBefore,listenerAfter:counts(),trace:out}));
return {samePosition:bot.entity.position.equals(before.p),sameHp:bot.health===before.hp,rows:out.rows.length,listenersRestored:JSON.stringify(listenerBefore)===JSON.stringify(counts())};

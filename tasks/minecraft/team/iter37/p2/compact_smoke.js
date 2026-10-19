// Read-only optional instrumentation. Install BEFORE combat listeners so pre-event ring
// is independent of their response. Call detach() in bounded caller's finally.
function installContactTelemetry(bot, limit=80) {
  const ring=[], events=[];
  const now=()=>{const p=bot.entity.position,e=Object.values(bot.entities).find(e=>e.name==='ender_dragon');return {t:Date.now(),hp:bot.health,p:[p.x,p.y,p.z],v:[bot.entity.velocity.x,bot.entity.velocity.y,bot.entity.velocity.z],yaw:bot.entity.yaw,pitch:bot.entity.pitch,using:!!bot.usingHeldItem,handFlags:bot.entity.metadata?.[8],shieldWear:bot.inventory.slots[45]?.name==='shield'?bot.inventory.slots[45].durabilityUsed:null,dragon:e?{id:e.id,p:[e.position.x,e.position.y,e.position.z],hp:e.metadata?.[9],phase:e.metadata?.[16]}:null};};
  const tick=()=>{ring.push(now());if(ring.length>limit)ring.shift();};
  const damage=p=>{if(p.entityId!==bot.entity.id)return;events.push({kind:'packet',packet:{...p},at:now(),before:ring.slice()});if(events.length>12)events.shift();};
  const health=()=>{events.push({kind:'health',at:now(),before:ring.slice(-8)});if(events.length>12)events.shift();};
  bot.on('physicsTick',tick);bot.on('health',health);bot._client.on('damage_event',damage);
  let closed=false;
  return {ring,events,detach(){if(closed)return;closed=true;bot.removeListener('physicsTick',tick);bot.removeListener('health',health);bot._client.removeListener('damage_event',damage);}};
}
// Caller: detach(); global.p1ContactRaw={events:h.events.slice(),tail:h.ring.slice()};
// Print actual ENDSTATE first, then JSON.stringify(compactContactReceipt(h,bot)).
// Full data stays in that player's global memory; never dump entire rings into arena output.
function compactContactReceipt(h,bot,cap=2800){
  const num=x=>typeof x==='number'?Math.round(x*1000)/1000:null;
  const sample=(r,t)=>r?[r.t-t,r.hp,...r.p.map(num),num(r.yaw),num(r.pitch),r.handFlags??null,r.shieldWear??null,...(r.dragon?.p||[null,null,null]).map(num)]:null;
  const source=h.events||[],chosen=source.slice(-4);
  const out={at:new Date().toISOString(),state:{p:[bot.entity.position.x,bot.entity.position.y,bot.entity.position.z].map(num),hp:bot.health,food:bot.food},eventCount:source.length,omittedEvents:Math.max(0,source.length-chosen.length),columns:['dtMs','hp','x','y','z','yaw','pitch','rawHandFlags','shieldWear','rootX','rootY','rootZ'],events:chosen.map(e=>({kind:e.kind,t:e.at?.t,ownId:e.ownId,packet:e.packet?[e.packet.entityId,e.packet.sourceTypeId,e.packet.sourceCauseId,e.packet.sourceDirectId]:null,at:sample(e.at,e.at?.t||0),preCount:e.before?.length||0,pre:(e.before||[]).slice(-3).map(r=>sample(r,e.at?.t||0))}))};
  while(JSON.stringify(out).length>cap&&out.events.some(e=>e.pre.length>1)){const e=out.events.find(e=>e.pre.length>1);e.pre.shift();}
  while(JSON.stringify(out).length>cap&&out.events.length){out.events.shift();out.omittedEvents++;}
  return out;
}

const counts=[bot.listenerCount("physicsTick"),bot.listenerCount("health"),bot._client.listenerCount("damage_event")];const h=installContactTelemetry(bot,8);try{await bot.waitForTicks(12);}finally{h.detach();global.p2ContactRaw={events:h.events.slice(),tail:h.ring.slice()};console.log("ENDSTATE_FIRST",JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food}));const r=compactContactReceipt(h,bot);console.log("CONTACT_COMPACT",JSON.stringify(r));if(JSON.stringify(r).length>2800)throw Error("BUDGET");const after=[bot.listenerCount("physicsTick"),bot.listenerCount("health"),bot._client.listenerCount("damage_event")];console.log("CLEANUP",JSON.stringify({counts,after,saved:global.p2ContactRaw.tail.length}));if(JSON.stringify(counts)!==JSON.stringify(after))throw Error("LEAK");}

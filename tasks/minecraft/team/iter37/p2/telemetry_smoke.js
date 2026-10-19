// Read-only optional instrumentation. Install BEFORE combat listeners so pre-event ring
// is independent of their response. Call detach() in bounded caller's finally.
function installContactTelemetry(bot, limit=80) {
  const ring=[], events=[];
  const now=()=>{const p=bot.entity.position,e=Object.values(bot.entities).find(e=>e.name==='ender_dragon');return {t:Date.now(),hp:bot.health,p:[p.x,p.y,p.z],v:[bot.entity.velocity.x,bot.entity.velocity.y,bot.entity.velocity.z],yaw:bot.entity.yaw,pitch:bot.entity.pitch,using:!!bot.usingHeldItem,shieldWear:bot.inventory.slots[45]?.name==='shield'?bot.inventory.slots[45].durabilityUsed:null,dragon:e?{id:e.id,p:[e.position.x,e.position.y,e.position.z],hp:e.metadata?.[9],phase:e.metadata?.[16]}:null};};
  const tick=()=>{ring.push(now());if(ring.length>limit)ring.shift();};
  const damage=p=>{if(p.entityId!==bot.entity.id)return;events.push({kind:'packet',packet:{...p},at:now(),before:ring.slice()});if(events.length>12)events.shift();};
  const health=()=>{events.push({kind:'health',at:now(),before:ring.slice(-8)});if(events.length>12)events.shift();};
  bot.on('physicsTick',tick);bot.on('health',health);bot._client.on('damage_event',damage);
  let closed=false;
  return {ring,events,detach(){if(closed)return;closed=true;bot.removeListener('physicsTick',tick);bot.removeListener('health',health);bot._client.removeListener('damage_event',damage);}};
}

const before=[bot.listenerCount("physicsTick"),bot.listenerCount("health"),bot._client.listenerCount("damage_event")];const h=installContactTelemetry(bot,8);try{await bot.waitForTicks(12);if(h.ring.length!==8||h.ring.some(r=>!Number.isFinite(r.yaw)||r.p.length!==3))throw Error("RING_POST");console.log("RING_SMOKE",JSON.stringify({samples:h.ring.length,last:h.ring.at(-1),events:h.events.length}));}finally{h.detach();h.detach();const after=[bot.listenerCount("physicsTick"),bot.listenerCount("health"),bot._client.listenerCount("damage_event")];console.log("LISTENER_CLEANUP",JSON.stringify({before,after}));if(JSON.stringify(before)!==JSON.stringify(after))throw Error("LISTENER_LEAK");}

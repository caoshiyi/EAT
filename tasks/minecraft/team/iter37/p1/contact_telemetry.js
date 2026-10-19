// Read-only optional instrumentation. Install BEFORE combat listeners so pre-event ring
// is independent of their response. Call detach() in bounded caller's finally.
function installContactTelemetry(bot, limit=80) {
  const ring=[], events=[];let priorHP=bot.health;
  const now=()=>{const p=bot.entity.position,e=Object.values(bot.entities).find(e=>e.name==='ender_dragon');return {t:Date.now(),hp:bot.health,p:[p.x,p.y,p.z],v:[bot.entity.velocity.x,bot.entity.velocity.y,bot.entity.velocity.z],yaw:bot.entity.yaw,pitch:bot.entity.pitch,using:!!bot.usingHeldItem,handFlags:bot.entity.metadata?.[8],shieldWear:bot.inventory.slots[45]?.name==='shield'?bot.inventory.slots[45].durabilityUsed:null,dragon:e?{id:e.id,p:[e.position.x,e.position.y,e.position.z],hp:e.metadata?.[9],phase:e.metadata?.[16]}:null};};
  const tick=()=>{ring.push(now());if(ring.length>limit)ring.shift();};
  const damage=p=>{events.push({ownId:bot.entity.id,kind:'packet',packet:{...p},at:now(),before:ring.slice()});if(events.length>12)events.shift();};
  const health=()=>{if(bot.health<priorHP){events.push({kind:'health_drop',at:now(),before:ring.slice(-40)});if(events.length>12)events.shift();}priorHP=bot.health;};
  bot.on('physicsTick',tick);bot.on('health',health);bot._client.on('damage_event',damage);
  let closed=false;
  return {ring,events,detach(){if(closed)return;closed=true;bot.removeListener('physicsTick',tick);bot.removeListener('health',health);bot._client.removeListener('damage_event',damage);}};
}

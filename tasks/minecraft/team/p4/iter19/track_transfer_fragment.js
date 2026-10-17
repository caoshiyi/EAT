// Inject into an OWNED transfer caller; attach immediately BEFORE normal toss.
// Recorder only. Recipient inventory+retained endings remain acceptance evidence.
// Always close in the caller's finally block; no persistent watcher.
function trackOwnTransfer(bot,{itemName,intended,onCollection,range=6}) {
  if(!itemName||!['p1','p2','p3','p4'].includes(intended))throw Error('TRANSFER_PROTOCOL_INPUT');
  const origin={x:bot.entity.position.x,y:bot.entity.position.y,z:bot.entity.position.z},ids=new Set(),events=[];
  const name=e=>bot.registry.items[e?.metadata?.[8]?.itemId]?.name;
  const nearby=e=>e?.position&&Math.hypot(e.position.x-origin.x,e.position.y-origin.y,e.position.z-origin.z)<=range;
  let active=true;
  const drop=e=>{if(active&&name(e)===itemName&&nearby(e))ids.add(e.id);};
  const collect=(who,e)=>{
    if(!active||!ids.has(e?.id))return;
    const event={at:new Date().toISOString(),entityId:e.id,itemName,collector:who?.username||null,collectorId:who?.id||null,intended,matchedIntended:who?.username===intended};
    events.push(event);if(onCollection)onCollection(event);
  };
  bot.on('itemDrop',drop);bot.on('playerCollect',collect);
  return {events,close(){active=false;bot.removeListener('itemDrop',drop);bot.removeListener('playerCollect',collect);}};
}

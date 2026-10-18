// Provenance: installed Mineflayer docs/api.md BossBar and documented events only.
// Paste function into owner caller; attach BEFORE End entry, stop in finally.
function observeBoss(bot) {
  const records=[]; const bindings=[]; const now=()=>new Date().toISOString();
  const add=(event,fn)=>{bot.on(event,fn);bindings.push([event,fn]);};
  for (const event of ['bossBarCreated','bossBarUpdated','bossBarDeleted']) add(event,b=>{
    const row={at:now(),event,title:b.title?.toString(),fraction:b.health,isDragonBar:b.isDragonBar,uuid:b.entityUUID};
    records.push(row);console.log('BOSS_OBSERVATION',JSON.stringify(row));
  });
  add('entityHurt',e=>{if(e?.name?.includes('dragon')){const row={at:now(),event:'entityHurt',id:e.id,name:e.name,p:e.position};records.push(row);console.log('DRAGON_HURT_EVENT',JSON.stringify(row));}});
  return {records,stop(){for(const [e,f] of bindings)bot.removeListener(e,f);return records;}};
}
const eventNames=['bossBarCreated','bossBarUpdated','bossBarDeleted','entityHurt'];
const before=eventNames.map(n=>bot.listenerCount(n));
const o=observeBoss(bot);try{console.log('OBSERVER_ATTACH',new Date().toISOString(),bot.game.dimension,eventNames.map(n=>bot.listenerCount(n)));await bot.waitForTicks(3);}finally{o.stop();console.log('OBSERVER_STOP',JSON.stringify({before,after:eventNames.map(n=>bot.listenerCount(n)),records:o.records,dim:bot.game.dimension,hp:bot.health,p:bot.entity.position}));}

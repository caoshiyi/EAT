// Read-only fragment for a caller that invokes stop() in finally. No actions or packets.
// Caller integration requires review; OW smoke does not prove End health observation.
function startCombatRecorder(bot, milliseconds=60000) {
  const began=Date.now(), dragons=new Map(), records=[];
  let active=true, closing=false, result=null, polls=0, missingDragon=0, last='', truncated=0;
  function snapshot(reason, detail=null, forced=false) {
    if(!active)return;
    const now=Date.now(), es=Object.values(bot.entities), ds=es.filter(e=>e.name==='ender_dragon');
    const crystals=es.filter(e=>e.name==='end_crystal').map(e=>e.id).sort((a,b)=>a-b);
    polls++;
    if(!ds.length)missingDragon++;
    const current=ds.map(e=>{const hp=e.metadata?.[9],phase=e.metadata?.[16];let s=dragons.get(e.id);if(!s){s={id:e.id,firstSeenMs:now-began,firstHP:null,minHP:null,lastHP:null,finiteSamples:0,unknownSamples:0};dragons.set(e.id,s);}if(Number.isFinite(hp)){if(s.firstHP===null)s.firstHP=hp;s.minHP=s.minHP===null?hp:Math.min(s.minHP,hp);s.lastHP=hp;s.finiteSamples++;}else s.unknownSamples++;return{id:e.id,hp:Number.isFinite(hp)?hp:null,phase,p:e.position.clone()};});
    const key=JSON.stringify([bot.game.dimension,current.map(e=>[e.id,e.hp,e.phase]),crystals]);
    if(forced||key!==last){const r={ms:now-began,reason,detail,dimension:bot.game.dimension,player:{p:bot.entity.position.clone(),hp:bot.health},dragons:current,crystals};if(records.length<256)records.push(r);else truncated++;console.log('COMBAT_OBSERVATION',JSON.stringify(r));last=key;}
    if(now-began>milliseconds&&!closing)stop('observation_budget');
  }
  function tick(){snapshot('physicsTick');}
  function update(e){if(['ender_dragon','end_crystal'].includes(e?.name))snapshot('entityUpdate',{id:e.id});}
  function gone(e){if(['ender_dragon','end_crystal'].includes(e?.name))snapshot('entityGone',{id:e.id},true);}
  function stop(reason='caller_finally'){if(!active||closing)return result;closing=true;snapshot('stop',{reason},true);active=false;bot.removeListener('physicsTick',tick);bot.removeListener('entityUpdate',update);bot.removeListener('entityGone',gone);result={reason,elapsed:Date.now()-began,polls,missingDragon,dragons:[...dragons.values()],records,truncated};console.log('COMBAT_OBSERVER_END',JSON.stringify(result));return result;}
  bot.on('physicsTick',tick);bot.on('entityUpdate',update);bot.on('entityGone',gone);
  snapshot('start',null,true);
  return{mark:(name,detail)=>snapshot('mark:'+name,detail,true),stop};
}

const events=['physicsTick','entityUpdate','entityGone'],before=events.map(x=>bot.listenerCount(x));const r=startCombatRecorder(bot,250);await bot.waitForTicks(12);r.mark('NO_ACTION_OW');const ended=r.stop('small_test_finally');console.log('SMOKE',JSON.stringify({dimension:bot.game.dimension,before,after:events.map(x=>bot.listenerCount(x)),ended,p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count])}));return ended;

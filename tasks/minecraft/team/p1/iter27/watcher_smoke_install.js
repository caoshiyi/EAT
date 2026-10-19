// Passive public observations only; no controls, movement, digging or actions.
// Owner installs once per generation in its own global, keeps across returns, reads next run.
function makeReturnWatcher(bot) {
  let stopped = false, previousHp = bot.health, dropped = 0, firstLoss = null, firstDeath = null;
  const rows = [], offsets = [[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
  const snapshot = event => {
    const p = bot.entity?.position, q = p?.floored();
    const hazards = Object.values(bot.entities || {}).filter(e => ['area_effect_cloud','dragon_fireball'].includes(e.name));
    hazards.sort((a,b) => a.position.distanceTo(p) - b.position.distanceTo(p));
    return {at:new Date().toISOString(),event,hp:bot.health,food:bot.food,dimension:bot.game.dimension,
      p:p?.clone(),ground:bot.entity?.onGround,loadedHazards:hazards.length,
      nearestHazards:hazards.slice(0,2).map(e=>({id:e.id,name:e.name,p:e.position.clone(),width:e.width,height:e.height})),
      boundary:q?offsets.map(d=>{const at=q.offset(...d),b=bot.blockAt(at);return{p:at,name:b?.name,full:!!b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')}}):[]};
  };
  const record = event => {
    let row;try{row=snapshot(event);}catch(e){row={at:new Date().toISOString(),event,hp:bot.health,error:String(e)};}
    if (rows.length === 8) {rows.shift();dropped++;}
    rows.push(row);return row;
  };
  const health = () => {const row=record(bot.health<previousHp?'health_loss':'health_update');if(bot.health<previousHp&&!firstLoss)firstLoss=row;previousHp=bot.health;};
  const death = () => {const row=record('death');if(!firstDeath)firstDeath=row;};
  bot.on('health',health);bot.on('death',death);record('installed');
  return {
    mark(label){if(!stopped)record('mark:'+label);},
    report(){return{stopped,rows:[...rows],dropped,firstLoss,firstDeath,
      scope:'Passive observations across owner program returns; absence of a logged hazard is not absence of a hazard. Death cause requires arena events.'};},
    stop(){if(!stopped){record('stopped');bot.removeListener('health',health);bot.removeListener('death',death);stopped=true;}return this.report();}
  };
}

if(global.iter27P1ReturnWatcher)throw Error('prior watcher exists; inspect first');
global.iter27P1ListenerBaseline={health:bot.listenerCount('health'),death:bot.listenerCount('death')};
global.iter27P1ReturnWatcher=makeReturnWatcher(bot);
global.iter27P1ReturnWatcher.mark('before_actual_program_return');
console.log('WATCHER_INSTALLED',JSON.stringify(global.iter27P1ReturnWatcher.report()));
return {p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dimension:bot.game.dimension,readOnly:true};

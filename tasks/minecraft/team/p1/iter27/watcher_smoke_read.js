
const w=global.iter27P1ReturnWatcher;if(!w)throw Error('watcher did not survive return');
w.mark('next_actual_program');const report=w.stop();
const baseline=global.iter27P1ListenerBaseline;
const result={p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dimension:bot.game.dimension,report,listenerCounts:{health:bot.listenerCount('health'),death:bot.listenerCount('death')},baseline};
delete global.iter27P1ReturnWatcher;delete global.iter27P1ListenerBaseline;
console.log('WATCHER_ACTUAL_SMOKE',JSON.stringify(result));
if(!report.rows.some(r=>r.event==='mark:before_actual_program_return')||!report.rows.some(r=>r.event==='mark:next_actual_program'))throw Error('missing cross-program marks');
if(result.listenerCounts.health!==baseline.health||result.listenerCounts.death!==baseline.death)throw Error('listener counts not restored');
if(report.firstLoss||report.firstDeath)throw Error('body changed; inspect captured actual observation');
return result;

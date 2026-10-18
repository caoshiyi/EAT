// PROPOSED FUNCTION ONLY. Player owner reviews/pastes into one small caller.
// Observation only: no control changes, interaction, pathfinding, packets or world mutation.
function startSettleReceiptTrace(cells, maxSamples = 40) {
  const watched = cells.map(p => p.clone());
  const started = Date.now(), samples = [], corrections = [];
  const countsBefore = {physicsTick:bot.listenerCount('physicsTick'),forcedMove:bot.listenerCount('forcedMove')};
  const observe = phase => ({phase, ms:Date.now()-started,
    position:bot.entity.position.clone(), velocity:bot.entity.velocity?.clone(),
    health:bot.health, food:bot.food, dimension:bot.game.dimension, onGround:bot.entity.onGround,
    controls:{...bot.controlState}, goalPresent:!!bot.pathfinder.goal,
    inventory:bot.inventory.items().map(i=>({name:i.name,count:i.count,durabilityUsed:i.durabilityUsed})),
    cells:watched.map(p=>({position:p.clone(),name:bot.blockAt(p)?.name??null}))});
  const tick = () => { if (samples.length < maxSamples) samples.push(observe('physicsTick')); };
  const forced = () => { if (corrections.length < maxSamples) corrections.push(observe('forcedMove')); };
  bot.on('physicsTick',tick); bot.on('forcedMove',forced);
  let finished = false;
  return {
    mark(phase) { if (samples.length < maxSamples) samples.push(observe(phase)); },
    finish() {
      if (!finished) { bot.removeListener('physicsTick',tick);bot.removeListener('forcedMove',forced);finished=true; }
      return {startedAtMs:started,finishedAtMs:Date.now(),samples,corrections,countsBefore,
        countsAfter:{physicsTick:bot.listenerCount('physicsTick'),forcedMove:bot.listenerCount('forcedMove')},
        terminal:observe('trace_finished')};
    }
  };
}

'use strict';
// Generic event helper for owner adaptation, no world/player access.
// matches must reject preexisting IDs and check exact kind/current operation region.
async function actAndWaitForSpawn(emitter, action, matches, timeoutMs = 2000) {
  let timer, listener;
  const arrival = new Promise((resolve, reject) => {
    listener = entity => {
      try { if (matches(entity)) resolve(entity); } catch (e) { reject(e); }
    };
    emitter.on('entitySpawn', listener); // installed BEFORE action
    timer = setTimeout(() => reject(Error('SPAWN_RECEIPT_TIMEOUT')), timeoutMs);
  });
  // Attach rejection handling before action can await.
  const outcome = arrival.then(value => ({value}), error => ({error}));
  try {
    await action();
    const result = await outcome;
    if (result.error) throw result.error;
    return result.value;
  } finally {
    clearTimeout(timer);
    emitter.removeListener('entitySpawn', listener);
  }
}
module.exports = {actAndWaitForSpawn};

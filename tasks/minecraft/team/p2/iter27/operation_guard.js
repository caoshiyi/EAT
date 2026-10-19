// Public bot state only. No movement, digging, placement, attacks or visibility admission.
// Owner MUST call forward() before mutations AND after each awaited operation inside helpers.
// A wrapper around a multi-await helper does not cancel that helper's remaining instructions.
function makeOperationGuard(bot) {
  const body = bot.entity, dimension = bot.game.dimension, startHp = bot.health;
  let dead = false, damaged = false, mode = 'forward', closed = false, lastHp = startHp;
  const failures = [];
  const floorNames = new Set([
    'end_stone', 'basalt', 'blackstone', 'cobbled_deepslate',
    'stone_bricks', 'mossy_stone_bricks', 'cracked_stone_bricks',
    'nether_bricks', 'sand', 'sandstone', 'netherrack', 'cobblestone'
  ]);
  const stopForward = () => { bot.clearControlStates(); bot.pathfinder.setGoal(null); };
  const onDeath = () => { dead = true; stopForward(); };
  const onHealth = () => {
    if (bot.health < lastHp) {
      damaged = true;
      if (mode === 'forward') stopForward();
    }
    lastHp = bot.health;
  };
  bot.on('death', onDeath); bot.on('health', onHealth);
  const fail = (label, why) => {
    const row = {label, why, hp: bot.health, p: bot.entity.position.clone(), mode};
    if (failures.length < 8) failures.push(row);
    throw Error('OPERATION_GUARD ' + label + ': ' + why);
  };
  const alive = label => {
    if (closed || dead || bot.health <= 0 || bot.entity !== body || bot.game.dimension !== dimension)
      fail(label, 'life/dimension/guard changed');
  };
  return {
    forward(label) {
      alive(label);
      onHealth(); // Also reconcile a changed health value before its event is observed.
      if (mode !== 'forward') fail(label, 'escape mode is irreversible in this operation');
      if (damaged || bot.health < startHp) { stopForward(); fail(label, 'HP loss: forward work retired'); }
    },
    beginEscape(label) { alive(label); mode = 'escape'; stopForward(); },
    escape(label) { alive(label); if (mode !== 'escape') fail(label, 'call beginEscape first'); },
    escapeFloor(label) {
      alive(label);
      if (mode !== 'escape') fail(label, 'call beginEscape first');
      const p = bot.entity.position;
      if (!bot.entity.onGround || Math.abs(p.y - Math.round(p.y)) > .04)
        fail(label, 'need actual settled grounded feet before selecting floor');
      const q = p.floored(); q.y = Math.round(p.y) - 1;
      const b = bot.blockAt(q);
      if (!b || !floorNames.has(b.name) || !b.shapes?.some(s => s.join(',') === '0,0,0,1,1,1'))
        fail(label, 'unqualified actual floor ' + b?.name);
      return {position: q, name: b.name};
      // Owner still checks actual reachable visible cursor, supported destination, tool,
      // budget and retreat geometry before ordinary digging. This is NOT action admission.
    },
    report() { return {startHp, hp: bot.health, damaged, dead, mode, failures: [...failures]}; },
    close() { if (!closed) { bot.removeListener('death', onDeath); bot.removeListener('health', onHealth); closed = true; } }
  };
}

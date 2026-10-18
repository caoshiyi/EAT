// Narrow normal-client observation helper: caller stops pathfinder/controls first.
// This only verifies vertical settling; it does not prove route, cover, or safety.
async function settledBody(bot, expectedY, maxTicks = 24) {
  for (let tick = 0; tick <= maxTicks; tick++) {
    const p = bot.entity.position;
    if (bot.entity.onGround && Math.abs(p.y - expectedY) <= 0.1) {
      return { ticks: tick, p: p.clone(), ground: true, hp: bot.health,
        velocity: bot.entity.velocity.clone() };
    }
    if (tick < maxTicks) await bot.waitForTicks(1);
  }
  throw Error('SETTLE_TIMEOUT ' + JSON.stringify({ expectedY, p: bot.entity.position,
    ground: bot.entity.onGround, hp: bot.health, velocity: bot.entity.velocity }));
}

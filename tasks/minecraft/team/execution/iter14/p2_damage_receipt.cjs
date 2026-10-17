// Optional narrow observation patch for the next P2 source caller. No controls.
function attachDamageReceipt(bot, limit = 12) {
  const body = bot.entity;
  const began = Date.now();
  const receipts = [];
  const pos = p => p ? { x: p.x, y: p.y, z: p.z } : null;
  const source = wireId => {
    if (!wireId) return null;
    const id = wireId - 1;
    const e = bot.entities[id];
    return { id, loaded: !!e, name: e?.name ?? null, p: pos(e?.position) };
  };
  const receive = p => {
    if (bot.entity !== body || p.entityId !== body.id) return;
    receipts.push({ elapsed: Date.now() - began, entityId: p.entityId,
      sourceTypeId: p.sourceTypeId, sourceCauseId: p.sourceCauseId,
      sourceDirectId: p.sourceDirectId, sourcePosition: pos(p.sourcePosition),
      cause: source(p.sourceCauseId), direct: source(p.sourceDirectId),
      body: pos(body.position), height: body.height, hpObserved: bot.health });
    if (receipts.length > limit) receipts.shift();
  };
  bot._client.on('damage_event', receive);
  return { receipts, cleanup: () => bot._client.removeListener('damage_event', receive) };
}
module.exports = { attachDamageReceipt };

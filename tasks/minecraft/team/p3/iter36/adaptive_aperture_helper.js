// Proposed helper for P1's existing caller; NOT run by P3 and not yet live-qualified.
// Requires existing v(), guard(), settled(), dig(), wait(), bot. Uses normal visible/reach-checked dig.
function reportedUpperAperture(error) {
  const m = /blocked by end_stone at (-?\d+),(-?\d+),(-?\d+)/.exec(String(error));
  if (!m) return null;
  const q = v(Number(m[1]), Number(m[2]), Number(m[3]));
  if (q.y < 57 || q.y > 58 || q.x < -6 || q.x > -4 || q.z < 3 || q.z > 5) return null;
  return q; // Never floor52, body walls53/54, top cap59, or an arbitrary distant cell.
}
async function clearReportedUpperAperture(q) {
  settled(-5, 53); guard();
  const cells = q.y === 57 ? [q, q.offset(0, 1, 0)] : [q];
  const changed = [];
  for (const cell of cells) {
    const block = bot.blockAt(cell);
    if (block?.boundingBox === 'empty') continue;
    if (block?.name !== 'end_stone') throw Error('APERTURE_MATERIAL ' + cell + ' ' + block?.name);
    // Existing dig() must prove actual face visibility + client reach, then server block ACK.
    await dig(cell, true);
    settled(-5, 53); guard();
    if (bot.blockAt(cell)?.boundingBox !== 'empty') throw Error('APERTURE_POST ' + cell);
    changed.push(cell.clone());
  }
  if (!changed.length) throw Error('APERTURE_NO_ACTUAL_CHANGE ' + q);
  const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
  if (!sword) throw Error('APERTURE_NO_SWORD');
  await bot.equip(sword, 'hand');
  await wait(15); guard(); // Re-charge same normal weapon after mining.
  console.log('APERTURE_ACK', JSON.stringify({at:new Date().toISOString(), changed, p:bot.entity.position, hp:bot.health}));
  return changed;
}
// Integrate only after landing53 from a refused jump; max TWO new aperture columns per batch.
// An out-of-scope/refused/occluded dig still ends the batch through the existing healthy retreat.
// Re-arm on a NEW pass (>8m); actual3m+innerbody+currentview/gaze+normal arena attack remain mandatory.

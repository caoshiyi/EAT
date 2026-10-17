// Physical counterexample: 3375 opened four boundary blocks with one carried
// dirt, relying on distant post-cut pickups. Closure failed; Skeleton death.
// Inputs must be retained ordinary inventory after cursor/container reconciliation.
// This gate is for opening an already protected boundary, not burying an exposed body.
function restorationReserve(items, changedCells, committed = 0) {
  const cells = new Set(changedCells.map(p => Array.isArray(p) ? p.join(',') : `${p.x},${p.y},${p.z}`));
  const cold = new Set(['dirt', 'cobblestone', 'sandstone', 'red_sandstone', 'stone', 'andesite', 'diorite', 'granite', 'blackstone', 'netherrack', 'nether_bricks']);
  const available = items.filter(i => cold.has(i.name) || i.name.endsWith('_planks')).reduce((a, i) => a + i.count, 0);
  const required = cells.size + committed;
  return { ok: available >= required, available, required, deficit: Math.max(0, required - available) };
}
module.exports = { restorationReserve };

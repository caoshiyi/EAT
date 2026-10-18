// PROPOSAL ONLY: player owner reviews/runs. Read-only observations; no movement or interaction.
// A snapshot, not a shelter builder or safety guarantee. Derive occupied cell fresh after final mutation.
const base = bot.entity.position.floored();
const faces = [[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
const cells = faces.map(d => {
  const p = base.offset(...d), b = bot.blockAt(p);
  return {p, name: b?.name ?? null, loaded: !!b,
    full: !!b?.shapes?.some(s => s.length === 6 && s.every((v,i) => v === [0,0,0,1,1,1][i]))};
});
return {
  observedAt: new Date().toISOString(), phase: 'fresh_terminal_observation',
  position: bot.entity.position.clone(), containingCell: base, dimension: bot.game.dimension,
  health: bot.health, food: bot.food, onGround: bot.entity.onGround,
  eyeHeight: bot.entity.eyeHeight, controls: {...bot.controlState},
  goalPresent: !!bot.pathfinder.goal, cells,
  allTenFull: cells.length === 10 && cells.every(c => c.loaded && c.full),
  inventory: bot.inventory.items().map(i => ({name:i.name,count:i.count,durabilityUsed:i.durabilityUsed}))
};

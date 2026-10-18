// PROPOSED FUNCTION ONLY: owner reviews/pastes into its existing read-only path probe.
// No pathfinding, movement, interaction, new global state or automatic player execution.
function annotatePathCells(path) {
  const V = bot.entity.position.constructor;
  const knownHazards = new Set(['sweet_berry_bush', 'cactus', 'water', 'lava', 'fire', 'soul_fire', 'magma_block', 'powder_snow']);
  return path.map((q, index) => {
    const cell = new V(Math.floor(q.x), Math.floor(q.y), Math.floor(q.z));
    const blocks = [-1, 0, 1].map(dy => {
      const p = cell.offset(0, dy, 0), b = bot.blockAt(p);
      return {dy, p, name: b?.name ?? null, loaded: !!b, knownHazard: !!b && knownHazards.has(b.name)};
    });
    return {index, node: {x:q.x,y:q.y,z:q.z}, cell, blocks,
      needsReview: blocks.some(b => !b.loaded || b.knownHazard)};
  });
}

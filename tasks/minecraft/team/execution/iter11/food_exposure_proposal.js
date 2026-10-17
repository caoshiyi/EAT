// Proposal to paste over exposedAt in P2 actual food caller; specialist does NOT run this on a player.
// Uses caller's existing bot, Vec3, full, openingCells. Maintains caller's outer standoff radii.
// Present exposure only, NOT future walking/climbing reachability.
function exposedAt(e, p) {
  if (!e?.position || !p) return true;
  const eye = e.position.offset(0, (e.height || 1.8) * .9, 0);
  for (const [dx, dz] of [[0,0],[-.3,-.3],[-.3,.3],[.3,-.3],[.3,.3]]) {
    for (const h of [.1,.9,1.7]) {
      const target = p.offset(dx,h,dz), v = target.minus(eye), len = v.norm();
      if (!Number.isFinite(len) || len < .05) return true;
      const dir = v.scaled(1 / len);
      // Unknown-only rays have no proven occluder and remain exposed.
      const hit = bot.world.raycast(eye, dir, len, (b,it) => {
        if (!b) return false;
        if (openingCells.has(b.position.toString()) || !full(b)) return false;
        const x = it.intersect(b.shapes, b.position); // integer shape offset, fractional eye retained
        if (!x) return false;
        const q = x.pos.minus(eye), along = q.x*dir.x + q.y*dir.y + q.z*dir.z;
        return along >= 0 && along < len - .02;
      });
      if (!hit) return true;
    }
  }
  return false;
}

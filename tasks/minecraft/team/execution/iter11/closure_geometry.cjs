'use strict';
// Pure client geometry proposal. No bot, world access, or player execution.
// Caller supplies feet position and measured pose dimensions. Unit full-cube caps only.
function bodyOverlapsCube(feet, cube, width = 0.6, height = 1.8) {
  const values = [feet.x, feet.y, feet.z, cube.x, cube.y, cube.z, width, height];
  if (!values.every(Number.isFinite) || width <= 0 || height <= 0) throw Error('INVALID_BODY_GEOMETRY');
  const r = width / 2;
  return feet.x + r > cube.x && feet.x - r < cube.x + 1 &&
    feet.y + height > cube.y && feet.y < cube.y + 1 &&
    feet.z + r > cube.z && feet.z - r < cube.z + 1;
}
function assertBodyClear(feet, cubes, width = 0.6, height = 1.8) {
  const occupied = cubes.filter(p => bodyOverlapsCube(feet, p, width, height));
  if (occupied.length) throw Error('CAP_BODY_OCCUPIED:' + JSON.stringify(occupied));
}
module.exports = { bodyOverlapsCube, assertBodyClear };

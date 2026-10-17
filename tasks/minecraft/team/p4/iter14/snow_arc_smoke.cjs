const assert=require('node:assert/strict'),arc=require('./snow_arc.cjs');
for(const t of[[20,5,0],[30,12,6],[40,0,0]]){const r=arc([0,0,0],t);assert(r.ok,JSON.stringify(r));assert(Math.abs(Math.hypot(...r.v)-1.5)<1e-8);assert(Math.hypot(...r.end.map((v,i)=>v-t[i]))<1e-7)}
assert.equal(arc([0,0,0],[5,0,0]).why,'EXPLOSION_DISTANCE_OR_RANGE');
assert.equal(arc([0,0,0],[30,8,0],()=>true).why,'ARC_BLOCKED');
assert.equal(arc([0,0,0],[48,80,0]).why,'NO_LOW_ARC');
console.log('snow arc synthetic PASS: speed, discrete endpoint, distance, blocked arc, unreachable target; actual End shot unqualified');

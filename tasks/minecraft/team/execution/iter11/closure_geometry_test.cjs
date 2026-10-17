'use strict';
const assert = require('node:assert/strict');
const { bodyOverlapsCube: overlap, assertBodyClear } = require('./closure_geometry.cjs');
const lower = { x: 2, y: 65, z: 4 }, upper = { x: 2, y: 66, z: 4 };
const actual = { x: 2.661611881731092, y: 64.5, z: 4.52540377010318 };
assert.equal(overlap(actual, lower), true);
assert.equal(overlap(actual, upper), true); // standing top 66.3
assert.equal(overlap(actual, upper, .6, 1.5), false); // crouch top 66.0 only touches
assert.throws(() => assertBodyClear(actual, [lower, upper]), /CAP_BODY_OCCUPIED/);
assert.doesNotThrow(() => assertBodyClear({x:1.5,y:65,z:4.5}, [lower,upper]));
assert.doesNotThrow(() => assertBodyClear({x:4.05,y:65,z:4.3}, [lower,upper]));
assert.equal(overlap({x:3.3,y:65,z:4.5}, lower), false);
assert.equal(overlap({x:3.299,y:65,z:4.5}, lower), true);
assert.equal(overlap({x:2.5,y:65,z:5.3}, lower), false);
assert.throws(() => overlap({x:NaN,y:65,z:4.5}, lower), /INVALID_BODY/);
assert.throws(() => overlap(actual,lower,0), /INVALID_BODY/);
const dx = actual.x - 2.5, dz = actual.z - 4.5;
assert.ok(Math.hypot(dx,dz) < .25);
assert.ok(Math.hypot(dx,actual.y-65,dz) > .25);
assert.equal(overlap({x:8.5,y:49.96,z:86.5},{x:8,y:49,z:86}),true);
assert.equal(overlap({x:8.5,y:50.01,z:86.5},{x:8,y:49,z:86}),false);
console.log('PASS: actual lower occupancy, pose-dependent upper, both-side clearance, touching edges, invalid inputs, horizontal vs 3D receipt');

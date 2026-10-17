'use strict';
// Host-only synthetic fixture: this is not an arena program and controls no player.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {Vec3} = require(process.cwd()+'/tools/mc_arena/node_modules/vec3');
const text = fs.readFileSync(__dirname+'/food_exposure_proposal.js','utf8');
let rays = 0, shapeOffsets = [], mode = 'blocked';
const openingCells = new Set([new Vec3(6,67,81).toString()]);
const source = {position:new Vec3(1.25,63,87.4),height:.9};
const blocked = {position:new Vec3(6,66,80),shapes:[[0,0,0,1,1,1]],boundingBox:'block'};
const ctx = {Number, openingCells, full:b=>b?.boundingBox==='block', bot:{world:{raycast(eye,dir,len,matcher) {
  rays++;
  const b = mode === 'door' ? {...blocked,position:new Vec3(6,67,81)} : blocked;
  if(mode === 'missing') return null; // installed world skips null blocks
  const distance = mode === 'behind' ? -1 : mode === 'beyond' ? len+1 : len/2;
  const it={intersect:(shapes, offset)=>{shapeOffsets.push(offset);return {pos:eye.plus(dir.scaled(distance))};}};
  return matcher(b,it) ? {position:b.position} : null;
}}}};
vm.createContext(ctx); vm.runInContext(text+'\nthis.testExposure=exposedAt;',ctx);
assert.equal(ctx.testExposure(source,new Vec3(6.6,67,81.5)),false);
assert.equal(rays,15);
assert.ok(shapeOffsets.every(p=>p===blocked.position));
for(mode of ['behind','beyond','door','missing']) assert.equal(ctx.testExposure(source,new Vec3(6.6,67,81.5)),true,mode);
mode='blocked';rays=0;
assert.equal(ctx.testExposure({position:new Vec3(6.5,66,81.5),height:.9},new Vec3(6.6,67,81.5)),false);
assert.equal(rays,15); // near4 and melee now actually consult terrain
assert.equal(ctx.testExposure(null,new Vec3(1,2,3)),true);
console.log('PASS: melee/near4 terrain branch, 15 body samples, integer offset, behind/beyond rejection, prospective opening, missing block conservative');

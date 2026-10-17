'use strict';
// Host-only installed synchronous raycast with synthetic cells; no world connection.
const assert=require('node:assert/strict'),base=process.cwd()+'/tools/mc_arena/node_modules/';
const {Vec3}=require(base+'vec3'),WorldSync=require(base+'prismarine-world/src/worldsync');
const origin=new Vec3(.5,1.5,.5),fullShape=[0,0,0,1,1,1];
function blocked(target,shape,opening=false){
 const getBlock=p=>({name:p.floored().x===2?'wall':'air',position:p.floored(),
   shapes:p.floored().x===2?[shape]:[]});
 const world={getBlock};
 const full=b=>b.shapes.some(s=>s.join(',')===fullShape.join(','));
 const openingCells=new Set(opening?['(2, 1, 0)']:[]);
 const d=target.minus(origin),len=d.norm();
 return WorldSync.prototype.raycast.call(world,origin,d.scaled(1/len),len,(b,it)=>{
  if(openingCells.has(b.position.toString())||!full(b))return false;
  const x=it.intersect(b.shapes,b.position);
  return !!x&&x.pos.distanceTo(origin)<len-.02;
 });
}
assert(blocked(new Vec3(3.5,1.5,.5),fullShape));
assert.equal(blocked(new Vec3(3.5,1.5,.5),fullShape,true),null);
assert.equal(blocked(new Vec3(3.5,1.5,.5),[0,0,0,1,.5,1]),null);
assert.equal(blocked(new Vec3(1.9,1.5,.5),fullShape),null);
assert.equal(blocked(new Vec3(2.01,1.5,.5),fullShape),null);
console.log('PASS installed sync matcher: solid beforetarget blocks; openingcell/partialslab/beyondtarget/endpointmargin do not certify occlusion. Synthetic rays, no mob/travel proof.');

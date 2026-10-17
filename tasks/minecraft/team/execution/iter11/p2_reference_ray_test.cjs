'use strict';
// Host geometry fixture using exact installed iterator/world raycast; no player programs.
const assert=require('node:assert/strict'),base=process.cwd()+'/tools/mc_arena/node_modules/';
const {Vec3}=require(base+'vec3'),WorldSync=require(base+'prismarine-world/src/worldsync');
const eye=new Vec3(6.500000097871441,69.1825,83.61633355586996);
const point=new Vec3(6.5,66,84.5),v=point.minus(eye),len=v.norm(),dir=v.unit();
const roof={name:'spruce_slab',position:new Vec3(6,69,83),shapes:[[0,.5,0,1,1,1]]};
const ground={name:'sand',position:new Vec3(6,65,84),shapes:[[0,0,0,1,1,1]]};
const bed={name:'white_bed',position:new Vec3(6,67,83),shapes:[[0,0,0,.1875,.5625,.1875],[0,0,.8125,.1875,.5625,1],[0,.1875,.1875,1,.5625,.8125],[.1875,.1875,0,1,.5625,.1875],[.1875,.1875,.8125,1,.5625,1]]};
const world={getBlock(p){const f=p.floored();return f.equals(roof.position)?roof:f.equals(ground.position)?ground:f.equals(bed.position)?bed:{position:f,shapes:[]};}};
const raw=WorldSync.prototype.raycast.call(world,eye,dir,len+.02,(b,it)=>!!it.intersect(b.shapes,b.position));
assert.equal(raw,roof);
let rejected=[];
const corrected=WorldSync.prototype.raycast.call(world,eye,dir,len+.02,(b,it)=>{
  const hit=it.intersect(b.shapes,b.position);
  if(!hit)return false;
  const along=hit.pos.minus(eye).dot(dir);
  if(along<0||along>len+.02){rejected.push({name:b.name,along});return false;}
  return true;
});
assert.equal(corrected,ground);
assert.ok(rejected.some(x=>x.name==='spruce_slab'&&x.along<0));
console.log(JSON.stringify({pass:true,raw:raw.name,corrected:corrected.name,rejected}));

// Host-only schema regression. No arena/player/network/server access.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('tasks/minecraft/team/p3/threats_lib.js','utf8');
const fn=vm.runInNewContext(source+';p3Threats');
const origin={x:0,y:65,z:0};const p=(x=1)=>({x,y:65,z:0});
const entities={cube:{id:1,name:'magma_cube',type:'mob',kind:'Hostile mobs',position:p()},named:{id:2,name:'enderman',type:'mob',kind:'Neutral mobs',position:p(2)},old:{id:3,name:'skeleton',type:'hostile',position:p(3)},cow:{id:4,name:'cow',type:'mob',kind:'Passive mobs',position:p()},player:{id:5,name:'p1',type:'player',position:p()},far:{id:6,name:'blaze',type:'mob',kind:'Hostile mobs',position:p(50)}};
assert.equal(JSON.stringify(fn(entities,origin,12).map(e=>e.id)),JSON.stringify([1,2,3]));
assert.throws(()=>fn(entities,origin,-1));
console.log('PASS schema: cube type=mob, named neutral, legacy hostile included; passive/player/far excluded; invalid bound rejected. No physical combat/LOS proof.');

// UNIT ONLY, based on observed SB48 coordinates, no arena access.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),c={};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/placement_occupancy.js','utf8'),c);
const b={entity:{id:3},entities:{40:{id:40,name:'enderman',position:{x:.6495381653564631,y:50,z:3.4294814888196434},width:.6,height:2.9}}};
for(const y of[50,51,52])assert.equal(c.placementOccupants(b,{x:0,y,z:3}).length,1);
for(const q of[{x:0,y:53,z:3},{x:1,y:50,z:3},{x:0,y:50,z:2}])assert.equal(c.placementOccupants(b,q).length,0);
assert.equal(b.entities[40].position.x,.6495381653564631);b.entities[40].position.x=1.3002384222507626;assert.equal(c.placementOccupants(b,{x:0,y:50,z:3}).length,1);console.log('UNIT_PASS observed tall Enderman overlaps50/51/52; disjoint53/x1/z2 clear; no mutation. No new world claim.');

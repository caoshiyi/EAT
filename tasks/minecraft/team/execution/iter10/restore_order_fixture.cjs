// Synthetic adjacency/order model only. No player code, bot, network or world.
const assert = require('assert/strict');
const dirs = [[0,-1,0],[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
const key = q => q.join(',');
const head = [-121,64,-180], foot = [-121,63,-180];
function run({floor=true, roof=false, dynamic=false}={}) {
  const full = new Set();
  if (floor) full.add(key([-121,62,-180]));
  if (roof) full.add(key([-121,65,-180]));
  const entries = {};
  entries[key(head)] = head;
  entries[key(foot)] = foot;
  const pending = Object.entries(entries), placed=[];
  const hasRef = q => dirs.some(d => full.has(key(q.map((n,i)=>n+d[i]))));
  while (pending.length) {
    const index = dynamic ? pending.findIndex(([,q])=>hasRef(q)) : 0;
    if (index<0 || !hasRef(pending[index][1])) return {placed,failed:pending[0][1]};
    const [,q] = pending.splice(index,1)[0];full.add(key(q));placed.push(q[1]);
  }
  return {placed,failed:null};
}
assert.deepEqual(run(),{placed:[],failed:head});
assert.deepEqual(run({dynamic:true}),{placed:[63,64],failed:null});
assert.deepEqual(run({floor:false,dynamic:true}),{placed:[],failed:head});
assert.deepEqual(run({roof:true}),{placed:[64,63],failed:null});
console.log('PASS: floor-only old order failsHEAD; dependency order FOOT→HEAD closes; unsupported terminates; roof anchor permits original order. Synthetic, not world qualification.');

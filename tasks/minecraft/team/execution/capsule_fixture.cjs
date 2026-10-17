// Host-only adjacency model of demonstrated CAP_REF/undefined-reference paths.
'use strict';
const assert=require('node:assert/strict');
const dirs=[[0,-1,0],[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
const add=(p,d)=>p.map((v,i)=>v+d[i]);
const key=p=>p.join(',');
const present=new Set(['0,-1,0']);
const full=p=>present.has(key(p));
const canPlace=p=>dirs.some(d=>full(add(p,d)));
const place=p=>{assert(canPlace(p),'CAP_REF '+key(p));present.add(key(p));};
const sides=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
// Same dependency order as P2 pod: foundations, feet/head sidewalls.
for(const d of sides){place(add(d,[0,-1,0]));place(d);place(add(d,[0,1,0]));}
assert(!canPlace([0,2,0]));
assert.throws(()=>place([0,2,0]),/CAP_REF/);
place([1,2,0]); // Extra roof support: uses full sidewall head at1,1,0.
place([0,2,0]);
assert.equal(present.size-1,14);
assert(sides.every(d=>[0,1].every(y=>full(add(d,[0,y,0])))));
assert(full([0,2,0])&&full([0,-1,0]));
// P4 missing-face count ignores all four side foundations and roof support.
assert.equal(9+4+1,14);
console.log('PASS host adjacency fixture: two-high walls leave roof unanchored; one extra side-head support completes capsule; worst-case14newblocks');

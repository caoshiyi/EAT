const assert=require('node:assert/strict'),plan=require('./surface_plan.cjs');
function terrain(top=65){return q=>{const[x,y,z]=q;if(x===0&&z===0&&[63,64].includes(y))return{name:'air',full:false};return y<=top?{name:'end_stone',full:true}:{name:'air',full:false}}}
let input={origin:[0,63,0],block:terrain(),stock:45,pickUses:44};
let p=plan(input);assert(p.ok);assert.equal(p.rise,3);assert.equal(p.cuts,1);assert.equal(p.extraFloors,2);assert.equal(p.exits.length,4);assert.equal(p.toolPrice,7);
assert.equal(plan({...input,stock:4}).why,'CAP_PRICE');
assert.equal(plan({...input,pickUses:6}).why,'TOOL_PRICE');
assert.equal(plan({...input,block:q=>q[1]===66?null:terrain()(q)}).why,'UNKNOWN_OR_OTHER_COLUMN');
assert.equal(plan({...input,block:terrain(80)}).why,'NO_BOUNDED_TOP');
assert.equal(plan({...input,block:q=>q[0]!==0||q[2]!==0?{name:'air',full:false}:terrain()(q)}).why,'NO_ADJACENT_NATIVE_SURFACE');
console.log('PASS finite surface planner: roof supply accounting, native exit, unknown/high/noexit and cap/tool refusal. Synthetic only.');

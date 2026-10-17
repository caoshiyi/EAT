const assert=require('node:assert/strict'),arc=require('./snow_arc_choices.cjs');
const origin=[0,65.52,0],target=[24,81,0],low=arc(origin,target),high=arc(origin,target,()=>false,'high');
for(const a of[low,high]){assert(a.ok,JSON.stringify(a));assert(Math.abs(Math.hypot(...a.v)-1.5)<1e-9);assert(a.end.every((v,i)=>Math.abs(v-target[i])<1e-8))}assert(high.ticks>low.ticks);assert(high.pitch>low.pitch);
const wall=(a,b)=>a[0]<=20&&b[0]>=20&&Math.max(a[1],b[1])<87;
assert.equal(arc(origin,target,wall).why,'ARC_BLOCKED');assert(arc(origin,target,wall,'high').ok);
assert(!arc(origin,[24,110,0],()=>false,'high').ok);assert(!arc(origin,[5,70,0]).ok);
console.log(JSON.stringify({test:'PASS two exact central arcs, same speed/endpoint; low-blocked/high-clear synthetic wall; unreachable/too-close rejected; no cage/world proof',lowTicks:low.ticks,highTicks:high.ticks}));

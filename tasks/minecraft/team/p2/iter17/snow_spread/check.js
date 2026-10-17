const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync('tasks/minecraft/team/p1/iter17/snow_arc_setup.js','utf8');new Function(src)();
const arc=global.P1SnowArc17;
function bound(origin,target,drift=0){const a=arc(origin,target);if(!a.ok)return a;const A=(1-.99**Math.floor(a.ticks))/.01+(a.ticks%1)*.99**Math.floor(a.ticks),noiseSpeed=1.5*.0172275,spread=A*noiseSpeed,full=A*(noiseSpeed+drift),maxDrift=1/A-noiseSpeed;return{origin,target,ticks:a.ticks,pitch:a.pitch,velocity:a.v,A,max_per_axis_random_spread:spread,assumed_abs_horizontal_drift:drift,max_axis_error:full,all_endpoints_inside_actual_crystal_2x2_AABB:full<1,max_abs_drift_for_this_sufficient_condition:maxDrift,limit:'free-space nominal-centre model only; actual blocks, target current existence and observed collision still required'}}
// First smoke checks: zero velocity error leaves nominal endpoint; velocity perturbation delta yields A*delta.
const origin=[64.5,56.52,-1.5],target=[42.5,78,.5],a=arc(origin,target);assert(a.ok);
for(const delta of [0,1.5*.0172275,-1.5*.0172275]){let p=origin.slice(),v=a.v.map(x=>x+delta);for(let t=0;t<Math.floor(a.ticks);t++){p=p.map((x,i)=>x+v[i]);v=v.map((x,i)=>x*.99-(i===1?.03:0))}p=p.map((x,i)=>x+(a.ticks%1)*v[i]);const A=(1-.99**Math.floor(a.ticks))/.01+(a.ticks%1)*.99**Math.floor(a.ticks);assert(Math.max(...p.map((x,i)=>Math.abs(x-target[i]-A*delta)))<1e-7)}
const result={fixture_cases:3,passed:true,public_noise_bound_source:'p4/iter15/public_1204/Projectile_bytecode.txt:triangle(0,.0172275)*1.5',nominal:bound(origin,target),drift_legacy_03:bound(origin,target,.03),drift_005:bound(origin,target,.005)};
console.log(JSON.stringify(result,null,2));

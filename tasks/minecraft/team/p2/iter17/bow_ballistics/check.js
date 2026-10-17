const fs=require('fs'),assert=require('assert');
let src=fs.readFileSync('tasks/minecraft/team/p1/iter17/snow_arc_setup.js','utf8').replace('P1SnowArc17','P2BowArc17').replace('g=.03,speed=1.5','g=.05,speed=3');
new Function(src)();const arc=global.P2BowArc17;
const power=t=>Math.min(1,((t/20)**2+2*(t/20))/3);
assert(power(0)===0);assert(Math.abs(power(10)-5/12)<1e-12);assert(power(20)===1&&power(40)===1);
const out=[];
for(const rootY of [77,80,83,86,89,92,98,101,104]){const origin=[64.5,56.52,-1.5],target=[42.5,rootY+1,.5],a=arc(origin,target);if(a.ok){let p=origin.slice(),v=a.v.slice();for(let t=0;t<Math.floor(a.ticks);t++){p=p.map((x,i)=>x+v[i]);v=v.map((x,i)=>x*.99-(i===1?.05:0))}p=p.map((x,i)=>x+(a.ticks%1)*v[i]);assert(Math.max(...p.map((x,i)=>Math.abs(x-target[i])))<1e-7);const A=(1-.99**Math.floor(a.ticks))/.01+(a.ticks%1)*.99**Math.floor(a.ticks);out.push({rootY,ok:true,ticks:a.ticks,pitch:a.pitch,noise_axis_bound:A*3*.0172275,limit:'hypothetical22m horizontal spacing; actual tower coordinates/terrain not modelled'})}else out.push({rootY,...a})}
console.log(JSON.stringify({power_fixture_cases:3,endpoint_fixture_cases:out.filter(x=>x.ok).length,passed:true,fullcharge_ticks:20,air_speed:3,gravity:.05,drag:.99,spawn:'eyeY-.1',rows:out},null,2));

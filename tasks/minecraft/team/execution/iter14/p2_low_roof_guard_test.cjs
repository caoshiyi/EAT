// Offline caller-preflight fixture. No arena, bot, network, or player program.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {Vec3}=require(process.env.EAT_ROOT+'/tools/mc_arena/node_modules/vec3');
const rows=JSON.parse(fs.readFileSync(__dirname+'/p2_6897_observation.json')).rows;
const names=new Map(rows.flatMap(([x,z,...cells])=>cells.map((c,i)=>[[x,57+i,z].join(','),c?.[0]])));
const source=fs.readFileSync(__dirname+'/p2_6904_preflight.js.txt','utf8');
const old="if(x===1&&[61,62].includes(y))continue;";
const fix="if(x===1&&[61,62,63].includes(y))continue;";
assert(source.includes(old),'must test exact deployed failed caller');
const changed=source.replace(old,fix);
function run(src,overrides=[]){const cells=new Map([...names,...overrides]);const name=p=>cells.get([p.x,p.y,p.z].join(','));return vm.runInNewContext(src,{Vec3,phase:'START',full:p=>!!name(p)&&!['air','nether_brick_fence'].includes(name(p)),bot:{blockAt:p=>({name:name(p)})}})}
assert.throws(()=>run(source),/SHAFT_SIDE_.*-132.*63.*-430/);
run(changed);
assert.throws(()=>run(changed,[['-133,62,-431','air']]),/SHAFT_SIDE/);
assert.throws(()=>run(changed,[['-132,63,-430','nether_brick_fence']]),/LOW_COMPOUND_OUTER/);
console.log('PASS: exact6904 failure reproduced; one-cell repair exception passes; unrelated shaft hole and partial roof still rejected.');

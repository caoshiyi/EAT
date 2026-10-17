// Host-only exact installed controlState accessor construction.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=process.cwd()+'/tools/mc_arena/node_modules/';
const s=fs.readFileSync(base+'mineflayer/lib/plugins/physics.js','utf8');
const a=s.indexOf('  bot.controlState = {}'),b=s.indexOf('  let lookingTask',a);
assert(a>0&&b>a);
const keys=['forward','back','left','right','jump','sprint','sneak'];
const controlState=Object.fromEntries(keys.map(k=>[k,false]));
const bot={setControlState:(k,v)=>{controlState[k]=v;},getControlState:k=>controlState[k]};
vm.runInNewContext(s.slice(a,b),{bot,controlState});
bot.setControlState('forward',true);bot.setControlState('jump',true);
assert.equal(JSON.stringify(bot.controlState),'{}');
const explicit=Object.fromEntries(keys.map(k=>[k,bot.getControlState(k)]));
assert(explicit.forward&&explicit.jump&&!explicit.sneak);
console.log('PASS exact accessor block: active forward/jump serialize as{}; explicit-key snapshot preserves actual states');

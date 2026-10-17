const fs=require('fs'),assert=require('assert');
const old=fs.readFileSync('tasks/minecraft/team/p3/iter9/full_occlusion_prefix.js','utf8');
const next=fs.readFileSync('tasks/minecraft/team/p3/iter10/entry_abort.js','utf8');
function actualPredicate(source){const a=source.indexOf("if(",source.indexOf('function guardDoor()'));const b=source.indexOf("throw Error('DOOR_DAMAGE_STOP')",a);return new Function('bot','mode','hurt','hp0','return '+source.slice(a+3,b).trim().slice(0,-1));}
const before=actualPredicate(old),after=actualPredicate(next);let cases=0;
for(const hp of[0.1,1,6.667,7.999,8,20])for(const hurt of[false,true]){assert.equal(after({health:hp},'exit',hurt,20),before({health:hp},'exit',hurt,20));assert.equal(after({health:hp},'enter',hurt,20),false);cases++;}
assert.equal(before({health:6.667},'enter',true,20),true);assert.equal(after({health:6.667},'enter',true,20),false);
assert(next.includes("if(dead||lost||bot.health<=0)"));assert(next.includes('bot.entity!==currentEntity'));
console.log('PASS exact caller predicates',cases,'cases; exit invariant, positive-health enter no work veto; death/body guards retained. Synthetic only.');

// Host-only exact installed pathfinder reset/manual-return branches.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const base=process.cwd()+'/tools/mc_arena/node_modules/';
const {Vec3}=require(base+'vec3');
const s=fs.readFileSync(base+'mineflayer-pathfinder/index.js','utf8');
const bot=new EventEmitter();bot.pathfinder={LOSWhenPlacingBlocks:true};
bot.entity={position:new Vec3(.5,0,.5)};
let aimed=0;
bot.lookAt=()=>{aimed++;};
bot.controlState={};bot.clearControlStates=()=>{bot.controlState={};};
bot.setControlState=(k,v)=>{bot.controlState[k]=v;};
const scope=vm.createContext({bot,performance,returningPos:new Vec3(10,0,0),stateGoal:null,
 dynamicGoal:false,path:[],digging:false,placing:false,pathUpdated:false,astarContext:null,
 stopPathing:false,stateMovements:{clearCollisionIndex:()=>{}},
 lockEquipItem:{release:()=>{}},lockPlaceBlock:{release:()=>{}},lockUseBlock:{release:()=>{}}});
const resetStart=s.indexOf('  function resetPath (');
const resetEnd=s.indexOf('  bot.pathfinder.setMovements',resetStart);
vm.runInContext(s.slice(resetStart,resetEnd),scope);
const moveStart=s.indexOf('  function moveToBlock (');
const moveEnd=s.indexOf('  function stop ()',moveStart);
vm.runInContext(s.slice(moveStart,moveEnd),scope);
const monitorStart=s.indexOf('  function monitorMovement ()');
const monitorEnd=s.indexOf('    if (path.length === 0)',monitorStart);
vm.runInContext(s.slice(monitorStart,monitorEnd)+'\n  }',scope);
bot.pathfinder.setGoal(null);
assert.equal(vm.runInContext('stateGoal',scope),null);
assert.equal(vm.runInContext('path.length',scope),0);
assert(vm.runInContext('returningPos !== null',scope));
vm.runInContext('monitorMovement()',scope);
assert.equal(bot.controlState.forward,true);assert.equal(aimed,1);
bot.clearControlStates();
bot.pathfinder.movements={LOSWhenPlacingBlocks:false};
vm.runInContext('monitorMovement()',scope);
assert.equal(bot.controlState.forward,true);assert.equal(aimed,2);
bot.clearControlStates();bot.pathfinder.LOSWhenPlacingBlocks=false;
vm.runInContext('monitorMovement()',scope);
assert.equal(bot.controlState.forward,undefined);assert.equal(aimed,2);
bot.pathfinder.LOSWhenPlacingBlocks=true;
vm.runInContext('monitorMovement()',scope);
assert.equal(bot.controlState.forward,true);assert.equal(aimed,3);
console.log('PASS exact reset/return branch: goalnull/path0 still steers; wrong movements flag does not suppress; correct pathfinder LOS=false suppresses, restoringtrue re-arms saved return');

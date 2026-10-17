const assert=require('node:assert/strict');
const Physics=require('../../../../../tools/mc_arena/node_modules/mineflayer-pathfinder/lib/physics');
const {Vec3}=require('../../../../../tools/mc_arena/node_modules/vec3');
const p=new Vec3(.5,66,-1.5),path=[p],tested=[];
function fixture(pos,lava){const x=Object.create(Physics.prototype);x.simulateUntil=()=>({pos,isInLava:lava,onGround:false});x.getController=()=>()=>{};return x;}
const bad=fixture(new Vec3(.5,65.9,-1.5),true);
for(const name of['canStraightLine','canWalkJump','canSprintJump']){const r=bad[name](path);tested.push({name,isInLava:true,pos:[.5,65.9,-1.5],target:[.5,66,-1.5],returned:r});assert.equal(r,true,'installed method accepts near-node simulatedLAVA state')}
const far=fixture(new Vec3(5.5,65.9,-1.5),true);assert.equal(far.canWalkJump(path),false);
const safe=fixture(new Vec3(.5,66,-1.5),false);assert.equal(safe.canWalkJump(path),true);
console.log(JSON.stringify({type:'SOURCE_LOGIC_SYNTHETIC_NOT_WORLD',tested,controls:'far lava rejected; exact safe accepted',fix:'require !state.isInLava before accepting reached(state)'},null,2));

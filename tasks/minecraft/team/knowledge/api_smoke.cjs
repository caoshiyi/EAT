// Host-only synthetic tests of installed CLIENT libraries. No player/bot/world.
const assert=require('node:assert/strict');const {EventEmitter}=require('node:events');
const root=process.env.EAT_ROOT;if(!root)throw Error('EAT_ROOT required');
const {Vec3}=require(root+'/tools/mc_arena/node_modules/vec3');
const goto=require(root+'/tools/mc_arena/node_modules/mineflayer-pathfinder/lib/goto');
(async()=>{
 const v=new Vec3(3,0,4),length=v.norm(),unit=v.unit();assert.equal(length,5);assert.equal(v.norm(),5);assert.notEqual(v,unit);assert.equal(unit.norm(),1);assert.equal(v.normalize(),v);assert.equal(v.norm(),1);console.log('PASS Vec3.unit preserves source; normalize mutates; captured length=5');
 const fake=new EventEmitter();fake.pathfinder={setGoal(goal){fake.emit('path_update',{path:[],status:'noPath'});}};
 await goto(fake,{});assert.equal(fake.eventNames().length,0);console.log('OBSERVED goto resolves on empty noPath, listeners cleaned; resolution is NOT arrival proof');
 const source=new EventEmitter();source.pathfinder={setGoal(goal){source.emit('path_update',{path:[{}],status:'noPath'});}};
 await assert.rejects(goto(source,{}),{name:'NoPath'});console.log('PASS nonempty noPath rejects: behavior differs solely by empty path');
 const Movements=require(root+'/tools/mc_arena/node_modules/mineflayer-pathfinder/lib/movements');
 const movement=Object.create(Movements.prototype);movement.bot={game:{minY:-64}};
 movement.getBlock=(node,dx,dy,dz)=>({position:new Vec3(node.x+dx,node.y+dy,node.z+dz),physical:node.y+dy===62,safe:true,liquid:false});
 movement.maxDropDown=1;assert.equal(movement.getLandingBlock(new Vec3(0,64,0),{x:1,z:0}),null);
 movement.maxDropDown=2;assert.equal(movement.getLandingBlock(new Vec3(0,64,0),{x:1,z:0}).position.y,63);
 console.log('PASS getLandingBlock feet64/support62: maxDropDown1 rejects, max2 accepts landingfeet63');
 const miningMd=require(root+'/tools/mc_arena/node_modules/minecraft-data')('1.20.4');
 const MiningBlock=require(root+'/tools/mc_arena/node_modules/prismarine-block')('1.20.4');
 const quartzBlock=MiningBlock.fromStateId(miningMd.blocksByName.nether_quartz_ore.defaultState);
 assert.equal(quartzBlock.digTime(null,false,false,false,[],{}),15000);
 assert.equal(quartzBlock.digTime(null,false,false,true,[],{}),75000);
 console.log('PASS 1.20.4 client quartz prediction: groundedhand15000ms/airhand75000ms; no world/harvest claim');
})().catch(e=>{console.error(e);process.exitCode=1});

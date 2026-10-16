// Local synthetic package test only. Does not connect to the arena or any player.
const fs=require('fs'),path=require('path');
const modules=path.join(process.cwd(),'tools/mc_arena/node_modules');
const {Vec3}=require(path.join(modules,'vec3'));
const registry=require(path.join(modules,'prismarine-registry'))('1.20.4');
const Block=require(path.join(modules,'prismarine-block'))(registry);
const {Movements}=require(path.join(modules,'mineflayer-pathfinder'));
const Move=require(path.join(modules,'mineflayer-pathfinder/lib/move'));
const factorySource=fs.readFileSync('tasks/minecraft/team/p2/nether_safe_movements.js','utf8');
const create=new Function('bot','Movements','require',factorySource+'\nreturn netherSafeMovements(bot,Movements);');
for(const scenario of['basalt','magma_floor','fire_feet','fire_head','closed_gate']){
 const overrides=new Map();if(scenario==='magma_floor')overrides.set('1,64,0','magma_block');if(scenario==='fire_feet')overrides.set('1,65,0','fire');if(scenario==='fire_head')overrides.set('1,66,0','fire');if(scenario==='closed_gate')overrides.set('1,65,0','spruce_fence_gate');
 const bot={registry,game:{minY:0},entity:{position:new Vec3(.5,65,.5),effects:{}},inventory:{items:()=>[]},entities:{},blockAt(p){const q=p.floored(),name=overrides.get([q.x,q.y,q.z].join(','))||(q.y===64?'basalt':'air');const b=Block.fromStateId(registry.blocksByName[name].minStateId,0);b.position=q;return b;}};
 const native=new Movements(bot);native.canDig=false;native.allowParkour=false;native.allow1by1towers=false;native.scafoldingBlocks=[];native.maxDropDown=2;native.blocksToAvoid.add(registry.blocksByName.magma_block.id);
 const safe=create(bot,Movements,name=>require(path.join(modules,name))),node=new Move(0,65,0,0,0),target=n=>n.x===1&&n.y===65&&n.z===0;
 console.log(JSON.stringify({scenario,nativeForward:native.getNeighbors(node).some(target),filteredForward:safe.getNeighbors(node).some(target),filteredCardinalOnly:safe.getNeighbors(node).every(n=>Math.abs(n.x)+Math.abs(n.z)<=1)}));
}

// Offline installed-client physics fixture; never connects or runs a player.
const root=process.env.EAT_ROOT+'/tools/mc_arena/node_modules/';
const {Vec3}=require(root+'vec3'),data=require(root+'minecraft-data')('1.20.4');
const Block=require(root+'prismarine-block')('1.20.4');
const {Physics,PlayerState}=require(root+'prismarine-physics');
const fs=require('fs');
const raw=fs.readFileSync(process.env.EAT_ROOT+'/tasks/minecraft/team/execution/records/5799.txt','utf8');
const receipt=JSON.parse(raw.split('-- returned --')[1]);
function trial(exact,jump){
 const map=new Map();
 if(exact) for(const [a,name,props] of receipt.cells){const b=Block.fromProperties(data.blocksByName[name].id,props,0);b.position=new Vec3(...a);map.set(a.join(','),b);}
 const world={getBlock(p){p=p.floored();const b=map.get([p.x,p.y,p.z].join(','));if(b)return b;const name=!exact&&p.y===63?'stone':'air';const fallback=Block.fromStateId(data.blocksByName[name].defaultState);fallback.position=p;return fallback}};
 const physics=Physics(data,world);const bot={version:'1.20.4',entity:{position:new Vec3(2.3,64.5,4.5209186354),velocity:new Vec3(0,-.0784,0),onGround:true,attributes:{},effects:{},yaw:Math.PI/2,pitch:-Math.PI/2},inventory:{slots:[]},jumpTicks:0,jumpQueued:jump};
 const controls={forward:true,back:false,left:false,right:false,jump,sprint:false,sneak:false};let states=[];
 for(let k=0;k<65;k++){const s=new PlayerState(bot,controls);physics.simulatePlayer(s,world).apply(bot);if(k<4||k===64)states.push([k,bot.entity.position.clone(),bot.entity.onGround]);}
 return states;
}
console.log('SMALL_OPEN_WORLD_JUMP',JSON.stringify(trial(false,true)));
console.log('RECORDED_GEOMETRY_JUMP',JSON.stringify(trial(true,true)));
console.log('RECORDED_GEOMETRY_NO_JUMP',JSON.stringify(trial(true,false)));

const assert=require('assert'),fs=require('fs'),{EventEmitter}=require('events'),{Vec3}=require('vec3');
const code=fs.readFileSync('tasks/minecraft/team/p1/iter15/dragon_one_swing.js','utf8');
const run=new Function('bot','require','return (async()=>{'+code+'})()');
async function trial(mode){
 const b=new EventEmitter(),controls={};let attacks=0,ticks=0;
 b.entity={id:1,position:new Vec3(0.5,64,.5),onGround:true};
 const dragon={id:2,name:'ender_dragon',position:new Vec3(2.5,65,.5),metadata:{9:200},width:16,height:8};
 Object.assign(b,{game:{dimension:'the_end'},health:20,food:20,bossBars:[{health:1,title:'Ender Dragon'}],entities:{2:dragon},inventory:{items:()=>[{name:'stone_sword',count:1,durabilityUsed:2}]},world:{raycast:()=>null},pathfinder:{setGoal:()=>{}},clearControlStates:()=>{for(const k of ['forward','back','left','right','jump','sprint','sneak'])controls[k]=false},getControlState:k=>controls[k],blockAt:()=>({name:'end_stone',shapes:[[0,0,0,1,1,1]]}),equip:async()=>{},lookAt:async()=>{},waitForTicks:async n=>{ticks+=n;if(mode==='death'&&ticks>=14)b.emit('death');if(mode==='damage'&&attacks)b.health=18},attack:()=>{attacks++;dragon.metadata[9]-=2;b.emit('entityHurt',dragon)}});
 if(mode==='far')dragon.position=new Vec3(40,65,0);
 if(mode==='blocked')b.world.raycast=()=>({name:'end_stone'});
 if(mode==='OW')b.game.dimension='overworld';
 const beforeListeners=b.eventNames().length,out=await run(b,require);
 assert.equal(b.eventNames().length,beforeListeners,'listener leak');assert(Object.values(out.controls).every(x=>!x),'controls retained');
 assert.equal(attacks,mode==='normal'||mode==='damage'?1:0,'attack count');
 if(mode==='normal')assert(out.trace.some(x=>x[0]==='HURT'));
 if(mode==='damage')assert.equal(out.issue,'DAMAGE_END');
 return{mode,issue:out.issue,swings:attacks,listenerCleanup:true,controlsFalse:true};
}
(async()=>{for(const mode of ['normal','far','blocked','OW','death','damage'])console.log(JSON.stringify(await trial(mode)))})().catch(e=>{console.error(e);process.exitCode=1});

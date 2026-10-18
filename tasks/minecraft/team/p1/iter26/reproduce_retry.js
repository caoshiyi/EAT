// Local mock regression: reproduces HP-loss retry; no Minecraft program/control.
const fs=require('fs'),A=Object.getPrototypeOf(async function(){}).constructor;
const root='tasks/minecraft/team/p1/iter26/';
async function check(file){
 let attempts=0,dead=false;
 class V{constructor(x,y,z){Object.assign(this,{x,y,z})}floored(){return new V(Math.floor(this.x),Math.floor(this.y),Math.floor(this.z))}offset(x,y,z){return new V(this.x+x,this.y+y,this.z+z)}equals(q){return this.x===q.x&&this.y===q.y&&this.z===q.z}distanceTo(q){return Math.hypot(this.x-q.x,this.y-q.y,this.z-q.z)}}
 const bot={health:17.333,game:{dimension:'the_nether'},entity:{position:new V(.5,8,.5)},blockAt:q=>({name:q.y===7?'netherrack':'air'}),pathfinder:{setGoal(){}},clearControlStates(){}};
 const context={bot,v:(...x)=>new V(...x),initialHP:17.333,
   alive:()=>{if(dead)throw Error('test stop after evidence')},full:q=>q.y===7,
   cut:async()=>{},flat:async()=>{},state:()=>({hp:bot.health}),
   travel:async()=>{attempts++;bot.health=12.333;if(attempts===2)dead=true;throw Error('travel HP loss')},
   console:{log(){}}};
 // Candidate references closure dead. A getter isn't a lexical variable; inject its live value
 // through a getter-only proxy binding function and replace reference for this mock only.
 let s=fs.readFileSync(root+file,'utf8');s=s.slice(s.indexOf('async function walkLow('),s.indexOf('const LOW_POINTS='));
 s=s.replace('if(dead||','if(isDead()||');context.isDead=()=>dead;
 let error;try{await new A(...Object.keys(context),s+';return walkLow([[0,8,0],[1,8,0]],0,1,1000);')(...Object.values(context));}catch(e){error=String(e)}
 return {file,attempts,hp:bot.health,error};
}
(async()=>{const old=await check('low_shared.js'),changed=await check('low_abort_candidate.UNEXECUTED.js');if(old.attempts!==2||changed.attempts!==1)throw Error('unexpected reproduction '+JSON.stringify({old,changed}));console.log(JSON.stringify({old,changed,scope:'LOCAL MOCK ONLY; no survival/closure/combat qualification'},null,2));})().catch(e=>{console.error(e);process.exit(1)});

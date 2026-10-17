const fs=require('fs');const A=Object.getPrototypeOf(async function(){}).constructor;
class Vec3{constructor(x,y,z){Object.assign(this,{x,y,z})}floored(){return this}offset(x,y,z){return new Vec3(this.x+x,this.y+y,this.z+z)}equals(p){return this.x===p.x&&this.y===p.y&&this.z===p.z}toString(){return [this.x,this.y,this.z].join(',')}}
(async()=>{for(const name of ['activate','insert_one'])for(const stage of [false,true]){
 let mutations=0;const bot={entity:{position:new Vec3(stage?134:0,-36,2276)},health:20,food:20,game:{dimension:'overworld'},inventory:{items:()=>[]},clearControlStates(){},pathfinder:{setGoal(){}},getControlState:()=>false,registry:{blocksByName:{end_portal_frame:{id:1}}},findBlocks:()=>Array.from({length:12},()=>new Vec3(134,-38,2274)),blockAt:()=>({name:'basalt',shapes:[[0,0,0,1,1,1]],getProperties:()=>({eye:false})}),equip:async()=>{mutations++},dig:async()=>{mutations++},placeBlock:async()=>{mutations++}};
 const r=await new A('bot','require',fs.readFileSync(__dirname+'/'+name+'.js','utf8'))(bot,()=>({Vec3}));
 if(mutations||!(stage?(name==='insert_one'?r.issue==='ONE_EYE_REQUIRED':r.issue.startsWith('EYES_REQUIRED')):r.issue==='STAGE'))throw Error(JSON.stringify({name,stage,mutations,r}));
 console.log(JSON.stringify({sourceOnly:true,name,stage,issue:r.issue,mutations,result:'PASS'}));
}})().catch(e=>{console.error(e);process.exitCode=1});

const assert=require('node:assert/strict'),fs=require('node:fs'),{Vec3}=require('vec3');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const action=new AsyncFunction('bot','require',fs.readFileSync(__dirname+'/ascent_unit.js','utf8'));
function fixture({dimension='the_end',surface=false,failJump=false,hurtCut=false}={}){
 const blocks=new Map(),key=q=>q.toArray().join(','),b=(name,q)=>({name,position:q.clone(),shapes:name==='end_stone'?[[0,0,0,1,1,1]]:[]});
 for(let x=-2;x<=2;x++)for(let y=49;y<=55;y++)for(let z=-2;z<=2;z++){const q=new Vec3(x,y,z);blocks.set(key(q),b('end_stone',q))}
 for(const y of[50,51]){const q=new Vec3(0,y,0);blocks.set(key(q),b('air',q))}
 if(surface)blocks.set('0,53,0',b('air',new Vec3(0,53,0)));
 let stone=0,jumpTicks=0,jumpBase=50,writes=0,selected=null;
 const controls={},listeners={},entity={id:1,position:new Vec3(.5,50,.5),height:1.8,onGround:true,metadata:{6:0}};
 const bot={entity,entities:{},game:{dimension},health:20,food:19,physics:{playerHeight:1.8},pathfinder:{setGoal(){}},clearControlStates(){for(const k in controls)controls[k]=false},setControlState(k,v){if(k==='jump'&&v&&!controls.jump){jumpBase=entity.position.y;jumpTicks=0}controls[k]=v},getControlState(k){return controls[k]||false},on(k,f){(listeners[k]??=[]).push(f)},removeListener(k,f){listeners[k]=listeners[k].filter(x=>x!==f)},stopDigging(){},inventory:{items(){return[{name:'stone_pickaxe',count:1,durabilityUsed:83},...(stone?[{name:'end_stone',count:stone}]:[])]}},blockAt(q){return blocks.get(key(q))??null},async equip(i){selected=i.name;writes++},async dig(bl){writes++;assert.equal(selected,'stone_pickaxe');blocks.set(key(bl.position),b('air',bl.position));stone++;if(hurtCut)bot.health=19},async waitForTicks(n){if(controls.jump&&!failJump){jumpTicks+=n;entity.position.y=Math.min(jumpBase+1.2,jumpBase+jumpTicks*.27);entity.onGround=false}const f=entity.position.floored(),under=blocks.get(key(f.offset(0,-1,0)));if(under?.name==='end_stone'&&f.y>jumpBase){entity.position.y=f.y;entity.onGround=true}},async _placeBlockWithOptions(ref,d){writes++;assert.equal(selected,'end_stone');const q=ref.position.plus(d);if(q.equals(new Vec3(0,50,0)))assert(entity.position.y>51);blocks.set(key(q),b('end_stone',q));stone--}};
 return{bot,read:()=>({writes,stone,listeners,blocks,controls})};
}
module.exports=fixture;
if(require.main===module)(async()=>{
 for(const[options,want]of[[{dimension:'overworld'},'END_REQUIRED_NO_ACTION'],[{surface:true},'SURFACE_OR_UNKNOWN_STOP']]){const f=fixture(options),r=await action(f.bot,require);assert.equal(r.issue,want);assert.equal(f.read().writes,0)}
 let f=fixture(),r=await action(f.bot,require);assert.equal(r.issue,null);assert.equal(r.completed,true);assert.equal(r.closed,true);assert.equal(r.p.y,51);assert.equal(f.read().stone,0);assert(Object.values(r.controls).every(v=>!v));assert(Object.values(f.read().listeners).every(a=>a.length===0));
 f=fixture({failJump:true});r=await action(f.bot,require);assert.equal(r.issue,'JUMP_BOUND');assert.equal(r.endingIssue,null);assert.equal(r.completed,false);assert.equal(r.closed,true);assert.equal(r.p.y,50);assert.equal(f.read().stone,0);
 f=fixture({hurtCut:true});r=await action(f.bot,require);assert.equal(r.issue,'DAMAGE_STOP');assert.equal(r.endingIssue,null);assert.equal(r.closed,true);assert.equal(r.hp,19);
 console.log('PASS source parse + no-action wrong world/surface; simulated one native up-step; failed jump and damage recover original roof; controls/listeners released. This is not physical Minecraft qualification.');
})().catch(e=>{console.error(e);process.exit(1)});

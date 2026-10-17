const assert=require('node:assert/strict'),fs=require('node:fs'),{Vec3}=require('vec3'),A=Object.getPrototypeOf(async function(){}).constructor,action=new A('bot','require',fs.readFileSync(__dirname+'/surface_peek.js','utf8'));
function fixture({hurtFirstCut=false,placeThenThrow=false,dimension='the_end',stale=false}={}){
 const blocks=new Map(),key=q=>q.toArray().join(','),full=(name,q)=>({name,position:q.clone(),shapes:[[0,0,0,1,1,1]]}),empty=q=>({name:'air',position:q.clone(),shapes:[]});
 for(let x=-2;x<=2;x++)for(let y=49;y<=56;y++)for(let z=-2;z<=2;z++){const q=new Vec3(x,y,z);blocks.set(key(q),y<=52?full('end_stone',q):empty(q))}
 for(const y of[50,51])blocks.set('0,'+y+',0',empty(new Vec3(0,y,0)));
 const inv={cobbled_deepslate:10,end_stone:0},controls={},listeners={},pending=[],self={id:1,position:new Vec3(.5,50,.5),height:1.8,onGround:true,metadata:{6:0}};
 let placements=0;let clock=0,jumpBase=50,jumpTicks=0,look=null,writes=0,cuts=0,selected=null;
 const block=q=>blocks.get(key(q))??null;
 const bot={entity:self,entities:{},game:{dimension},health:20,food:19,physics:{playerHeight:1.8},pathfinder:{setGoal(){}},clearControlStates(){for(const k in controls)controls[k]=false;self.height=1.8;self.metadata[6]=0;jumpTicks=0},setControlState(k,v){if(k==='jump'&&v&&!controls.jump){jumpBase=self.position.y;jumpTicks=0}controls[k]=v;if(k==='sneak'){self.height=v?1.5:1.8;self.metadata[6]=v?5:0}},getControlState(k){return controls[k]||false},on(k,f){(listeners[k]??=[]).push(f)},removeListener(k,f){listeners[k]=listeners[k].filter(x=>x!==f)},stopDigging(){},inventory:{items(){return[{name:'stone_pickaxe',count:1,durabilityUsed:40+cuts},...Object.entries(inv).filter(([n,c])=>c).map(([name,count])=>({name,count}))]}},blockAt:block,async equip(i){selected=i.name;writes++},async lookAt(q){look=q},async dig(b){assert.equal(selected,'stone_pickaxe');writes++;cuts++;blocks.set(key(b.position),empty(b.position));pending.push({name:b.name,due:clock+5});if(hurtFirstCut&&cuts===1)bot.health=19},async _placeBlockWithOptions(ref,d){writes++;const q=ref.position.plus(d);assert(inv[selected]>0);assert(!block(q)?.shapes.length);blocks.set(key(q),full(selected,q));inv[selected]--;placements++;if(placeThenThrow&&placements===1)throw Error('PLACE_ACK_UNKNOWN')},async waitForTicks(n){for(let i=0;i<n;i++){
 clock++;for(let k=pending.length-1;k>=0;k--)if(pending[k].due<=clock){inv[pending[k].name]++;pending.splice(k,1)}
 if(controls.forward&&look){let dx=look.x-self.position.x,dz=look.z-self.position.z,len=Math.hypot(dx,dz);if(len>.01){const d=Math.min(.12,len);self.position.x+=dx/len*d;self.position.z+=dz/len*d}}
 if(controls.jump){jumpTicks++;self.position.y=Math.min(jumpBase+1.2,jumpBase+jumpTicks*.27);self.onGround=false}
 const p=self.position.floored(),under=block(p.offset(0,-1,0));
 if(under?.shapes.length){if(!controls.jump||p.y>jumpBase){self.position.y=p.y;self.onGround=true}}
 else if(!controls.jump){self.position.y-=1;self.onGround=false;const b=block(self.position.floored().offset(0,-1,0));if(b?.shapes.length){self.position.y=Math.floor(self.position.y);self.onGround=true}}
 }}};
 global.P4SurfacePlan={ok:true,origin:[0,50,0],top:52,rise:3,cuts:1,extraFloors:2,toolPrice:7,exits:[[1,53,0]],at:Date.now()-(stale?40000:0),entityId:1};
 return{bot,read:()=>({writes,inv,listeners,pending})};
}
module.exports=fixture;
if(require.main===module)(async()=>{
 for(const[opt,want]of[[{dimension:'overworld'},'FRESH_END_SURFACE_PLAN_REQUIRED_NO_ACTION'],[{stale:true},'FRESH_NATIVE_PLAN']]){const f=fixture(opt),r=await action(f.bot,require);assert.equal(r.issue,want);assert.equal(f.read().writes,0)}
 let f=fixture(),r=await action(f.bot,require);assert.equal(r.issue,null,JSON.stringify(r));assert.equal(r.endingIssue,null);assert(r.reachedSurface&&r.closed);assert.equal(r.p.y,50);assert.equal(r.hp,20);assert.deepEqual(f.read().inv,{cobbled_deepslate:10,end_stone:0});assert(Object.values(f.read().listeners).every(a=>!a.length));assert(Object.values(r.controls).every(v=>!v));
 f=fixture({placeThenThrow:true});r=await action(f.bot,require);assert.equal(r.issue,'PLACE_ACK_UNKNOWN');assert.equal(r.endingIssue,null,JSON.stringify(r));assert(r.closed);assert.equal(r.p.y,50);
 f=fixture({hurtFirstCut:true});r=await action(f.bot,require);assert.equal(r.issue,'DAMAGE_OR_LOCAL_THREAT');assert.equal(r.endingIssue,null,JSON.stringify(r));assert(r.closed);assert(!r.reachedSurface);assert.equal(r.p.y,50);
 console.log('PASS synthetic fresh/stale/end guards, three-rise surface/native-step/reverse/roof receipt, delayed native pickup after damage recovery + placement succeeded before promise rejection. No physical End qualification.');
})().catch(e=>{console.error(e);process.exit(1)});

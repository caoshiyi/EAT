// Offline control-flow fixture. Stubs movement/mining/physics; never plays arena.
const fs=require('fs'),vm=require('vm');
class Vec3{constructor(x,y,z){Object.assign(this,{x,y,z})}offset(x,y,z){return new Vec3(this.x+x,this.y+y,this.z+z)}minus(q){return this.offset(-q.x,-q.y,-q.z)}equals(q){return this.x===q.x&&this.y===q.y&&this.z===q.z}floored(){return new Vec3(Math.floor(this.x),Math.floor(this.y),Math.floor(this.z))}clone(){return this.offset(0,0,0)}toString(){return this.x+','+this.y+','+this.z}norm(){return Math.hypot(this.x,this.y,this.z)}}
const route=JSON.parse(fs.readFileSync('tasks/minecraft/team/p3/iter15/home_route.json','utf8'));
const blocks=new Map(),key=q=>q.toString(),set=(q,n)=>blocks.set(key(q),n);
for(const a of route){let q=new Vec3(...a);set(q,'air');set(q.offset(0,1,0),'air')}
for(let y=63;y<=70;y++)set(new Vec3(-272,y,-231),'netherrack');
const start=new Vec3(-133,57,-430);
for(let x=-206;x<=-133;x++)for(let y=57;y<=58;y++)set(new Vec3(x,y,-430),'air');
for(const a of [[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]])set(start.offset(...a),'netherrack');
for(const x of [-221,-219])for(const y of [63,64])set(new Vec3(x,y,-180),'basalt');
set(new Vec3(-121,63,-180),'dirt');set(new Vec3(-121,64,-180),'air');
const inject=process.argv.includes('--fail-wall');let failed=false;
let inv={nether_bricks:4,blaze_rod:1,stone_pickaxe:1},moves=0,clears=0;
const bot={entity:{position:start.clone(),onGround:true},game:{dimension:'the_nether'},health:11.5,food:16,inventory:{items:()=>Object.entries(inv).filter(([n,c])=>c>0).map(([name,count])=>({name,count,durabilityUsed:name==='stone_pickaxe'?68:null}))},on(){},removeListener(){},clearControlStates(){clears++},pathfinder:{setGoal(){}},deactivateItem(){},blockAt(q){let name=blocks.get(key(q))??'netherrack';return {name,shapes:name==='air'?[]:[[0,0,0,1,1,1]],boundingBox:name==='air'?'empty':'block'}},waitForTicks:async()=>{}};
const hooks=`
move=async q=>{bot.entity.position=q.clone();moves++;if(inject&&!failed&&q.x===-221&&q.y===63&&q.z===-180){failed=true;throw Error('FIXTURE_INTERRUPTED_W221')}};
line=async(a,q)=>{if(a.y!==q.y||Math.abs(a.x-q.x)+Math.abs(a.z-q.z)>8)throw Error("FIXTURE_BAD_LINE");bot.entity.position=q.clone();moves++};
cut=async q=>{const n=name(q);if(n==='air')return;if(n==='basalt'||n==='dirt')inv[n]=(inv[n]||0)+1;set(q,'air');const a=bot.entity.position;if(q.x===a.x&&q.z===a.z&&q.y===a.y-1)bot.entity.position=q.clone()};
put=async(q,exact=null)=>{if(full(q))return;const n=exact||'nether_bricks';if(!(inv[n]>0))throw Error("FIXTURE_NO_STOCK_"+n);inv[n]--;set(q,n)};
up=async()=>{bot.entity.position=bot.entity.position.offset(0,1,0)};
seal=async q=>{bot.entity.position=q.clone();return true};
`;
let source=fs.readFileSync('tasks/minecraft/team/p3/iter15/home_return_controller.js','utf8');
source=source.replace('try{\n const start=',hooks+'\ntry{\n const start=');
const ctx={require:()=>({Vec3}),console:{log(){}},Date,inv,set,moves:0,inject,failed:false};vm.createContext(ctx);vm.runInContext(source+';this.run=homeReturn',ctx);
ctx.run(bot).then(r=>{if((inject?r.issue!=='FIXTURE_INTERRUPTED_W221'||r.home:r.issue||!r.home)||!r.closed||r.rodsAfter!==1||r.borrowed)throw Error(JSON.stringify(r));for(const x of[-221,-219])for(const y of[63,64])if(bot.blockAt(new Vec3(x,y,-180)).name!=='basalt')throw Error('RESTORE_BASALT');if(bot.blockAt(new Vec3(-121,63,-180)).name!=='dirt'||bot.blockAt(new Vec3(-121,64,-180)).name!=='air')throw Error('RESTORE_DIRT');console.log(JSON.stringify({fixture:'PASS',injected_wall_failure:inject,home:r.home,rods:r.rodsAfter,shared_exact:true,controls_cleared:clears,scope:'stub movement/mining/physics; control flow only'}));}).catch(e=>{console.error(e);process.exitCode=1});

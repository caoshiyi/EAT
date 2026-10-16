// Host-only replay of ONE recorded guard's class/occlusion scope. No bot/world connection.
// Default is exact executed #1722 source. Other guard closures may need different mocks;
// failure is evidence to inspect, never permission to weaken a guard.
const fs=require('node:fs'),assert=require('node:assert/strict');
const root=process.env.EAT_ROOT,{Vec3}=require(root+'/tools/mc_arena/node_modules/vec3');
const file=process.argv[2]||root+'/tasks/minecraft/team/knowledge/record_1722.txt';
const text=fs.readFileSync(file,'utf8'),a=text.indexOf('function guard('),open=text.indexOf('{',a);
if(a<0||open<0)throw Error('guard missing');let depth=0,end=-1;
for(let i=open;i<text.length;i++){if(text[i]==='{')depth++;if(text[i]==='}'&&--depth===0){end=i+1;break;}}
if(end<0)throw Error('guard shape changed');const source=text.slice(a,end);
const current=new Vec3(0,65,0);let covered=true;
const bot={health:20,entity:{position:current.offset(.5,0,.5)},entities:{},world:{raycast(){return covered?{}:null}}};
const run=new Function('bot','current','life','full','key',source+';return guard;')(bot,current,()=>{},()=>true,p=>p.toString());
for(const name of['magma_cube','ghast','blaze']){
 bot.entities={test:{name,kind:'Hostile mobs',type:'mob',position:new Vec3(10,65,0),height:4}};
 covered=true;run(current);covered=false;assert.throws(()=>run(current),/FOE/);
 console.log('OBSERVED '+name+' distance~9.5: occluded accepted; clear rejected');
}
console.log('PASS recorded guard includes ranged classes in >=8 occluded exception. Synthetic scope only; not projectile/gameplay safety.');

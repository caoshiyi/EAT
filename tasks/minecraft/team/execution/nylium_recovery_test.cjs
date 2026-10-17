'use strict';
// Exact executed put() branch with host bot/world stubs. No connection or player program.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {Vec3}=require(process.cwd()+'/tools/mc_arena/node_modules/vec3');
const raw=fs.readFileSync('tasks/minecraft/team/execution/records/4155.txt','utf8');
const line=raw.split('\n').find(l=>l.startsWith('async function put(q)'));
assert(line);
const q=new Vec3(-96,63,85);
const originalSelector="const it=bot.inventory.items().find(i=>i.name===(original||'cobblestone'));";
assert(line.includes(originalSelector));
function context(phase){
 let placed=null;
 const inventory=[{name:'cobblestone',count:37}];
 const bot={inventory:{items:()=>inventory},blockAt:p=>({name:placed&&p.equals(q)?placed:p.equals(q.offset(0,-1,0))?'basalt':'air',position:p}),
   equip:async i=>{bot.heldItem=i;},
   _placeBlockWithOptions:async()=>{placed=bot.heldItem.name;}};
 return vm.createContext({bot,q,phase,capNames:['cobblestone','dirt'],originals:new Map([[q.toString(),'warped_nylium']]),
  newCaps:[],V:a=>new Vec3(...a),f:b=>b&&b.name!=='air',tick:async()=>{}});
}
(async()=>{
 const old=context('recovery');vm.runInContext(line,old);
 await assert.rejects(vm.runInContext('put(q)',old),/CAP_STOCK/);
 const patched=line.replace(originalSelector,"const it=bot.inventory.items().find(i=>phase==='recovery'?capNames.includes(i.name):i.name===(original||'cobblestone'));");
 const revised=context('recovery');vm.runInContext(patched,revised);
 await vm.runInContext('put(q)',revised);
 assert.equal(vm.runInContext('bot.blockAt(q).name',revised),'cobblestone');
 assert.equal(vm.runInContext('originals.get(q.toString())',revised),'warped_nylium');
 const work=context('work');vm.runInContext(patched,work);
 await assert.rejects(vm.runInContext('put(q)',work),/CAP_STOCK/);
 console.log('PASS exact4155 put: old recovery refuses held37COBBLE for NYLIUM; scopedselector placesCOBBLE; work original requirement preserved. Synthetic anchors/world only.');
})().catch(e=>{console.error(e);process.exitCode=1});

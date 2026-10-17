// Host-only exact installed plugin, deliberately no incoming server packets.
'use strict';
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const base=process.cwd()+'/tools/mc_arena/node_modules/';
const {Vec3}=require(base+'vec3');
const bot=new EventEmitter(),client=new EventEmitter();
const block={position:new Vec3(1,2,3),name:'netherrack',type:87};
let local=block,updates=0,incoming=0;
const outgoing=[];
client.on('block_change',()=>incoming++);
client.write=(name,p)=>outgoing.push([name,p.status]);
bot._client=client;
bot.lookAt=async()=>{};
bot.swingArm=()=>{};
bot._updateBlockState=(p,state)=>{
 assert.equal(state,0);const old=local;local={position:p,type:0,name:'air'};
 bot.emit('blockUpdate:'+p,old,local);bot.emit('blockUpdate',old,local);
};
require(base+'mineflayer/lib/plugins/digging.js')(bot);
bot.digTime=()=>1;
bot.on('blockUpdate',()=>updates++);
(async()=>{
 await bot.dig(block,true);
 assert.equal(incoming,0);
 assert.equal(local.name,'air');
 assert.equal(updates,1);
 assert.deepEqual(outgoing,[['block_dig',0],['block_dig',2]]);
 console.log('PASS exact dig plugin: resolves + local AIR + ordinary blockUpdate with ZERO incoming server packets');
})().catch(e=>{console.error(e);process.exitCode=1});

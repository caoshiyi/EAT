// Host-only exact installed dig branch: synthetic intersection epsilon.
'use strict';
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const base = process.cwd() + '/tools/mc_arena/node_modules/';
const {Vec3} = require(base+'vec3');
const inject = require(base+'mineflayer/lib/plugins/digging.js');
const block = {name:'spruce_log',position:new Vec3(0,3,0),shapes:[[0,0,0,1,1,1]],diggable:true};
async function run(face, epsilon) {
  const bot = new EventEmitter();
  bot.entity={position:new Vec3(.5,0,.5),eyeHeight:1.62};
  const packets=[];
  bot._client={write:(kind,data)=>{packets.push([kind,data.status]);}};
  bot.swingArm=()=>{};
  bot.lookAt=async()=>{};
  bot._updateBlockState=(p)=>bot.emit('blockUpdate:'+p, block, {type:0});
  const start=bot.entity.position.offset(0,bot.entity.eyeHeight,0);
  bot.world={raycast:(origin,dir)=>({position:block.position,face:0,
    intersect:start.plus(dir.scaled(3-start.y-epsilon))})};
  inject(bot);
  bot.digTime=()=>1;
  await bot.dig(block,true,face);
  return packets;
}
(async()=>{
  await assert.rejects(run('raycast',1e-12), /Block not in view/);
  assert.deepEqual(await run('raycast',0),[['block_dig',0],['block_dig',2]]);
  assert.deepEqual(await run(undefined,1e-12),[['block_dig',0],['block_dig',2]]);
  console.log('PASS exact installed dig: same-target intersection epsilon can reject raycast; exact distance and default pass');
})().catch(e=>{console.error(e);process.exitCode=1});

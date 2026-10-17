'use strict';
// Host synthetic events only; no player execution or network.
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), {EventEmitter} = require('node:events');
const {actAndWaitForSpawn} = require('./filtered_spawn.cjs');
const {Vec3} = require(process.cwd()+'/tools/mc_arena/node_modules/vec3');
const source = fs.readFileSync('tools/mc_arena/node_modules/mineflayer/lib/plugins/place_entity.js','utf8');
const snippet = source.slice(source.indexOf('  function waitForEntitySpawn'),source.indexOf('\n  bot.placeEntity ='));
async function installed(wrongFirst) {
  const bot = new EventEmitter(); bot.supportFeature = () => false;
  const ctx = {bot, setTimeout:fn=>setTimeout(fn,15)};
  vm.createContext(ctx); vm.runInContext(snippet+'\nthis.wait=waitForEntitySpawn;',ctx);
  const expected = {id:2,name:'boat',position:new Vec3(0,0,0)};
  const p = ctx.wait('boat',new Vec3(0,0,0));
  if(wrongFirst) bot.emit('entitySpawn',{id:1,name:'enderman',position:new Vec3(0,0,0)});
  bot.emit('entitySpawn',expected);
  return p;
}
(async()=>{
  assert.equal((await installed(false)).id,2);
  await assert.rejects(installed(true),/Failed to place entity/);
  const e = new EventEmitter(), match=x=>x.name==='boat'&&x.id===2;
  const boat={id:2,name:'boat'};
  const result=await actAndWaitForSpawn(e,async()=>{
    e.emit('entitySpawn',{id:1,name:'enderman'});
    e.emit('entitySpawn',{id:8,name:'boat'});
    e.emit('entitySpawn',boat);
  },match,30);
  assert.equal(result,boat);
  assert.equal(e.listenerCount('entitySpawn'),0);
  await assert.rejects(actAndWaitForSpawn(e,async()=>{},match,5),/TIMEOUT/);
  assert.equal(e.listenerCount('entitySpawn'),0);
  await assert.rejects(actAndWaitForSpawn(e,async()=>{throw Error('ACTION_FAIL')},match,30),/ACTION_FAIL/);
  assert.equal(e.listenerCount('entitySpawn'),0);
  await assert.rejects(actAndWaitForSpawn(e,async()=>{e.emit('entitySpawn',boat)},()=>{throw Error('MATCH_FAIL')},30),/MATCH_FAIL/);
  assert.equal(e.listenerCount('entitySpawn'),0);
  console.log('PASS installed real waiter fails unrelated-first; local helper handles synchronous matched spawn, unrelated/wrong ID, timeout, action/matcher failure, listener cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});

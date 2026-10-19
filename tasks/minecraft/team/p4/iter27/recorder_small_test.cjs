const fs=require('fs'),vm=require('vm'),{EventEmitter}=require('events'),assert=require('assert');
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync('tasks/minecraft/team/p4/iter27/hazard_recorder.js','utf8'),scope);
const bot=new EventEmitter();Object.assign(bot,{entity:{id:1,name:'player',position:{x:0,y:26,z:0},onGround:true},health:20,food:20,entities:{}});
const names=['health','death','entitySpawn','entityGone','entityHurt','physicsTick'];
const before=names.map(n=>bot.listenerCount(n));const t=scope.makeHazardRecorder(bot,20);
for(let i=0;i<10;i++)bot.emit('physicsTick');
bot.entities[2]={id:2,name:'area_effect_cloud',position:{x:0,y:27,z:0}};bot.emit('entitySpawn',bot.entities[2]);bot.health=16;bot.emit('health');t.mark('afterDamage');
const out=t.stop();assert.equal(out.rows.length,7);assert(out.rows.find(x=>x.event==='health').entities.some(e=>e.name==='area_effect_cloud'));
assert.deepEqual(names.map(n=>bot.listenerCount(n)),before);assert.equal(t.stop().rows.length,7);
const capped=scope.makeHazardRecorder(bot,3);for(let i=0;i<20;i++)bot.emit('health');const c=capped.stop();assert.equal(c.rows.length,3);assert(c.dropped>0);assert.deepEqual(names.map(n=>bot.listenerCount(n)),before);
console.log(JSON.stringify({test:'synthetic event plumbing ONLY',rows:out.rows.length,listenerCountsRestored:true,bounded:c.rows.length,dropped:c.dropped,pass:true}));

const ring=scope.makeHazardRecorder(bot,128);for(let i=0;i<400;i++)bot.emit('physicsTick');bot.health=2;bot.emit('health');const r=ring.stop();assert.equal(r.rows.length,48);assert.equal(r.effectiveLimit,48);assert(r.rows.some(x=>x.event==='health'&&x.hp===2));assert.equal(r.rows.at(-1).event,'stop');assert.equal(r.rows[0].event,'start');console.log(JSON.stringify({test:'terminal retention synthetic ONLY',requested:128,effective:r.effectiveLimit,dropped:r.dropped,health2Retained:true,stopRetained:true,pass:true}));

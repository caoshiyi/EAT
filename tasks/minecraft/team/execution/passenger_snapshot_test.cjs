'use strict';
// Host-only installed callback reproduction. No network or player code.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const s=fs.readFileSync('tools/mc_arena/node_modules/mineflayer/lib/plugins/entities.js','utf8');
const bot=new EventEmitter();bot._client=new EventEmitter();
const boat={id:1,passengers:[]},mob={id:2,name:'enderman',isValid:true};
bot.entities={1:boat,2:mob};bot.entity={id:99};
const scope=vm.createContext({bot,fetchEntity:id=>bot.entities[id]});
const start=s.indexOf("  bot._client.on('set_passengers'");
const end=s.indexOf('  bot.swingArm =',start);
assert(start>=0&&end>start);
vm.runInContext(s.slice(start,end),scope);
bot._client.emit('set_passengers',{entityId:1,passengers:[2]});
assert.equal(boat.passengers[0],mob);
bot._client.emit('set_passengers',{entityId:1,passengers:[]});
assert.equal(boat.passengers[0],mob);
assert.equal(mob.vehicle,boat);
bot.emit('entityGone',mob); // actual destroy callback emits bot event, not _client
assert.equal(boat.passengers[0],mob);
console.log('PASS exact installed handlers: empty passenger snapshot retains old mob; bot entityGone does not reach _client listener. Synthetic, not proof of historical packet contents.');

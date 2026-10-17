// Host-only exact installed entity_metadata callback; synthetic entities/packets.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const base=process.cwd()+'/tools/mc_arena/node_modules/';
const registry=require(base+'prismarine-registry')('1.20.4');
assert.equal(registry.supportFeature('mcDataHasEntityMetadata'),true);
const source=fs.readFileSync(base+'mineflayer/lib/plugins/entities.js','utf8');
const begin=source.indexOf("  bot._client.on('entity_metadata', (packet) => {");
const end=source.indexOf("\n  bot._client.on('entity_effect'",begin);
assert(begin>0&&end>begin);
const bot=new EventEmitter();bot._client=new EventEmitter();bot.registry=registry;
bot.supportFeature=name=>registry.supportFeature(name);
const own={id:1,name:'player',metadata:[]},other={id:2,name:'dolphin',metadata:[]};
bot.entity=own;
const entities=new Map([[1,own],[2,other]]);
vm.runInNewContext(source.slice(begin,end),{bot,
 fetchEntity:id=>entities.get(id),
 parseMetadata:(updates,previous)=>{for(const m of updates)previous[m.key]=m.value;return previous;},
 hasFireworkSupport:false});
const airKey=registry.entitiesByName.player.metadataKeys.indexOf('air_supply');
const packet=(id,raw)=>bot._client.emit('entity_metadata',{entityId:id,metadata:[{key:1,type:'varint',value:raw}]});
packet(1,300);
assert.equal(bot.oxygenLevel,20);
packet(2,6000);
assert.equal(bot.oxygenLevel,400);
assert.equal(Math.round(own.metadata[airKey]/15),20);
packet(2,15);
assert.equal(bot.oxygenLevel,1);
assert.equal(Math.round(own.metadata[airKey]/15),20);
console.log('PASS exact installed callback: other-entity packets overwrite global oxygen to400/1 while own breath remains20; own air_supply key1');

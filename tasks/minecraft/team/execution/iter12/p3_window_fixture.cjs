// Offline exact installed openChest return-shape test. No arena/player calls.
const assert=require('node:assert/strict');const r=process.env.EAT_ROOT+'/tools/mc_arena/node_modules/';
const {createWindow}=require(r+'prismarine-windows')('1.20.4');const w=createWindow(17,'minecraft:generic_9x3','offline fixture');
class Block{constructor(){this.name='chest'}}
const bot={openBlock:async()=>w};require(r+'mineflayer/lib/plugins/chest.js')(bot);
(async()=>{const c=await bot.openChest(new Block());assert.equal(c,w);assert.equal(c.window,undefined);assert.ok(Array.isArray(c.slots));
c.slots[0]={name:'stone_pickaxe',durabilityUsed:100};c.slots[c.inventoryStart]={name:'stone_pickaxe',durabilityUsed:71};
const containerSlot=wear=>c.slots.findIndex((i,k)=>k<c.inventoryStart&&i?.name==='stone_pickaxe'&&i.durabilityUsed===wear);
const ownSlot=wear=>c.slots.findIndex((i,k)=>k>=c.inventoryStart&&k<c.inventoryEnd&&i?.name==='stone_pickaxe'&&i.durabilityUsed===wear);
assert.equal(containerSlot(100),0);assert.equal(ownSlot(71),c.inventoryStart);console.log('PASS: openChest returns Window directly; direct-slot selectors identify weak-container and strong-own tools; no physical transfer tested.');})();

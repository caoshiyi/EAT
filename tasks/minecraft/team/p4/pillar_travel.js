const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(10);
for(let n=0;n<8;n++){
const p=bot.entity.position.floored();const base=bot.blockAt(p.offset(0,-1,0));if(base?.boundingBox!=='block')throw Error('no solid floor');
const ceiling=bot.blockAt(p.offset(0,2,0));if(['sand','gravel'].includes(ceiling?.name))throw Error('gravity ceiling: do not pillar');if(ceiling&&ceiling.boundingBox==='block'){const pick=bot.inventory.items().find(i=>i.name.endsWith('_pickaxe'));if(pick)await bot.equip(pick,'hand');await bot.dig(ceiling);await bot.waitForTicks(7);}
const item=bot.inventory.items().find(i=>i.name==='dirt')||bot.inventory.items().find(i=>['cobblestone','andesite','gravel','granite','diorite'].includes(i.name));if(!item){console.log('no blocks');break;}
await bot.equip(item,'hand');await bot.waitForTicks(4);await bot.lookAt(base.position.offset(.5,1,.5),true);bot.setControlState('jump',true);await bot.waitForTicks(4);
try{await bot.placeBlock(base,new Vec3(0,1,0));}catch(e){console.log(e.message);break;}finally{bot.setControlState('jump',false);}
await bot.waitForTicks(12);console.log('height',bot.entity.position.y);if(bot.entity.position.y>=71)break;
}
console.log('safe',bot.entity.onGround,bot.blockAt(bot.entity.position.offset(0,1,0)).name);console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

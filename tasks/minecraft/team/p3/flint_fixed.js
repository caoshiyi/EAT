bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(6);
const {Vec3}=require('vec3');const p=bot.entity.position.floored();let base;
for(const [x,z]of[[1,0],[-1,0],[0,1],[0,-1]]){const b=bot.blockAt(p.offset(x,-1,z)),a=bot.blockAt(p.offset(x,0,z));if(b?.boundingBox==='block'&&a&&!/water|lava/.test(a.name)){base=b;break;}}
console.log('base',base?.position,'inv',bot.inventory.items().map(i=>[i.name,i.count]));if(!base)throw Error('need adjacent support');const above=bot.blockAt(base.position.offset(0,1,0));if(above.name!=='air')await bot.dig(above);
for(let n=0;n<24;n++){
if(bot.inventory.items().some(i=>i.name==='flint'))break;const g=bot.inventory.items().find(i=>i.name==='gravel');if(!g)break;
await bot.equip(g,'hand');await bot.placeBlock(base,new Vec3(0,1,0));await bot.waitForTicks(3);const b=bot.blockAt(base.position.offset(0,1,0));if(b.name!=='gravel')throw Error('placement changed '+b.name);await bot.dig(b);await bot.waitForTicks(8);console.log(n,'inv',bot.inventory.items().filter(i=>['gravel','flint'].includes(i.name)).map(i=>[i.name,i.count]));
}
return {p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

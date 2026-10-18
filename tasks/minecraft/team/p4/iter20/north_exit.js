const V=require('vec3').Vec3;const out=[];await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_pickaxe'),'hand');
for(const y of [-35,-36]){
const p=new V(129,y,2273),b=bot.blockAt(p); await bot.lookAt(p.offset(.5,.5,.7),false); await bot.waitForTicks(3);
const hit=bot.blockAtCursor(4.5);const pre={p,name:b.name,hit:hit&&hit.position,visible:bot.canSeeBlock(b),distance:bot.entity.position.offset(0,1.62,0).distanceTo(p.offset(.5,.5,.7))};out.push(pre);console.log('PRE',JSON.stringify(pre));
if(!hit||!hit.position.equals(p)||!pre.visible)return {out,refused:'ray mismatch'};
await bot.dig(b,false,'raycast');await bot.waitForTicks(5);out.push({after:bot.blockAt(p).name,hp:bot.health});if(bot.health<20)return {out,refused:'hurt'};
}
return {out,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed})),pos:bot.entity.position};

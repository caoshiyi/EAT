const V=require('vec3').Vec3;
const out=[];
for(const [x,y,z] of [[130,-35,2274],[130,-36,2274],[129,-35,2273],[129,-35,2275],[129,-34,2274]]){
 const b=bot.blockAt(new V(x,y,z)); const p=b.position.offset(.5,.5,.5);
 await bot.lookAt(p,true); await bot.waitForTicks(2);
 const hit=bot.blockAtCursor(4.5); out.push({target:b.name,pos:b.position,eyeDistance:bot.entity.position.offset(0,bot.entity.height,0).distanceTo(p),visible:bot.canSeeBlock(b),cursor:hit&&{name:hit.name,pos:hit.position,face:hit.face}});
}
return {out,pos:bot.entity.position,hp:bot.health};

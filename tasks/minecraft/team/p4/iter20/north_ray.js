const V=require('vec3').Vec3;const out=[];
for(const [x,y,z] of [[129.5,-34.4,2273.5],[129.5,-34.8,2273.5],[129.25,-34.6,2273.8],[129.75,-34.6,2273.8],[130.5,-35.5,2274.5]]){
await bot.lookAt(new V(x,y,z),true);await bot.waitForTicks(3);const b=bot.blockAtCursor(4.5);out.push({point:{x,y,z},yaw:bot.entity.yaw,pitch:bot.entity.pitch,height:bot.entity.height,hit:b&&{p:b.position,n:b.name}});
}return {out,pos:bot.entity.position};

const V=require('vec3').Vec3;const dest=new V(129.5,-36,2273.5);const hp=bot.health;const trail=[];
try {for(let i=0;i<30;i++){
 const p=bot.entity.position;if(bot.health<hp||p.y<-36.2)throw Error('hurt/fall');
 const feet=bot.blockAt(new V(129,-36,2273)),head=bot.blockAt(new V(129,-35,2273)),floor=bot.blockAt(new V(129,-37,2273));
 if(feet.boundingBox!=='empty'||head.boundingBox!=='empty'||!floor.shapes.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1))throw Error('geometry');
 if(Math.hypot(p.x-dest.x,p.z-dest.z)<.17)break;
 await bot.lookAt(new V(dest.x,p.y+1.62,dest.z),true);bot.setControlState('forward',true);await bot.waitForTicks(1);trail.push([p.x,p.y,p.z]);
}}finally{bot.clearControlStates();}
await bot.waitForTicks(4);return {trail,pos:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count}))};

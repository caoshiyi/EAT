const V=require('vec3').Vec3;
async function go(x,y,z){
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(2);const start=bot.entity.position.clone(),until=Date.now()+3500;
 if(y>start.y+.3){bot.setControlState('jump',true);let rose=false;for(let t=0;t<12;t++){await bot.waitForTicks(1);if(bot.entity.position.y>=y+.005){rose=true;break;}}bot.setControlState('jump',false);if(!rose)throw Error('actual in-place rise below nextfloor');}
 try{while(Math.hypot(bot.entity.position.x-x-.5,bot.entity.position.z-z-.5)>.06){if(Date.now()>until||bot.health<=0)throw Error('manual adjacent budget');await bot.lookAt(new V(x+.5,bot.entity.position.y+bot.entity.eyeHeight,z+.5),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}
 finally{bot.clearControlStates();}await bot.waitForTicks(14);if(Math.abs(bot.entity.position.y-y)>.08||!bot.entity.onGround)throw Error('manual actual endpoint absent');console.log('TWO_PHASE_STEP',JSON.stringify({start,target:[x,y,z],p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,velocity:bot.entity.velocity}));
}

await go(45,61,1);await go(45,62,0);return {p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>({n:i.name,c:i.count}))};

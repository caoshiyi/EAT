const {Vec3}=require('vec3');
const dim=bot.game.dimension,origin=bot.entity.position.clone();let discontinuity=false;
const stop=()=>{discontinuity=true;bot.clearControlStates();bot.pathfinder.setGoal(null);bot.stopDigging()};
bot.on('death',stop);bot.on('respawn',stop);bot.on('end',stop);
try {
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(3);
 if(discontinuity||bot.game.dimension!==dim||bot.health<=0)throw Error('LIFE_DISCONTINUITY');
 const p=bot.entity.position.floored();const full=b=>b?.shapes?.some(s=>s.every((v,i)=>v===(i<3?0:1)));
 const faces=[p.offset(0,-1,0),p.offset(0,2,0),...[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[p.offset(x,0,z),p.offset(x,1,z)])];
 console.log('FRESH',JSON.stringify({position:bot.entity.position,dimension:dim,hp:bot.health,food:bot.food,onGround:bot.entity.onGround,moved:bot.entity.position.distanceTo(origin),shell:faces.every(v=>full(bot.blockAt(v))),faces:faces.map(v=>({p:[v.x,v.y,v.z],name:bot.blockAt(v)?.name,full:full(bot.blockAt(v))})),inventory:bot.inventory.items().map(i=>({name:i.name,count:i.count,wear:i.durabilityUsed})),equipment:[5,6,7,8,45].map(slot=>({slot,name:bot.inventory.slots[slot]?.name,wear:bot.inventory.slots[slot]?.durabilityUsed})),forward:global.P1Forward||null}));
 for(const v of [new Vec3(-269,57,-429),new Vec3(-269,60,-429)])console.log('BRICK_LEAD',v.toString(),bot.blockAt(v)?.name);
 console.log('FINAL_CONTINUITY',!discontinuity&&bot.game.dimension===dim&&bot.health>0);
} finally {bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',stop);bot.removeListener('respawn',stop);bot.removeListener('end',stop);}

const ring=[];let hurt=false,dead=false,ticks=0;const hp0=bot.health;
function snap(){return {at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,near:Object.values(bot.entities).filter(e=>['ender_dragon','area_effect_cloud','dragon_fireball'].includes(e.name)||(e.name==='enderman'&&e.position.distanceTo(bot.entity.position)<5)).map(e=>({id:e.id,n:e.name,p:e.position.clone(),w:e.width,h:e.height,yaw:e.yaw,phase:e.name==='ender_dragon'?e.metadata?.[16]:undefined,metadata:e.name==='area_effect_cloud'?e.metadata:undefined}))};}
const tick=()=>{if(++ticks%5===0){ring.push(snap());if(ring.length>24)ring.shift();}};
const health=()=>{if(bot.health<hp0){hurt=true;console.log('HURT',JSON.stringify({now:snap(),ring}));}};
const death=()=>{dead=true;console.log('DEATH',JSON.stringify({now:snap(),ring}));};
bot.on('physicsTick',tick);bot.on('health',health);bot.on('death',death);
console.log('PRACTICE_START',JSON.stringify(snap()));
try{for(let i=0;i<2400&&!hurt&&!dead;i++){await bot.waitForTicks(1);if(i%200===0)console.log('PRACTICE_SAMPLE',JSON.stringify(snap()));}}
finally{bot.removeListener('physicsTick',tick);bot.removeListener('health',health);bot.removeListener('death',death);global.p1PracticeNorth={now:snap(),ring,hurt,dead};bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('PRACTICE_FINAL',JSON.stringify(global.p1PracticeNorth));}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));let respawned=false,done=false,death=false;
bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);
const onDeath=()=>{death=true;console.log('RESET DEATH captured');};
const onSpawn=async()=>{respawned=true;console.log('RESET RESPAWN',bot.entity.position);bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.lookAt(bot.entity.position.offset(25,1.6,0),true);bot.setControlState('sprint',true);bot.setControlState('jump',true);bot.setControlState('forward',true);await bot.waitForTicks(80);bot.clearControlStates();done=true;console.log('RESPAWN EAST LANDING',bot.entity.position,bot.health);};
bot.once('death',onDeath);bot.once('spawn',onSpawn);
try{const m=new Movements(bot);m.canDig=false;m.maxDropDown=4;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;const t=setTimeout(()=>bot.pathfinder.setGoal(null),8000);try{await bot.pathfinder.goto(new goals.GoalNear(-14.6,2,6.5,2));}catch(e){console.log(e.message);}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates();}
const end=Date.now()+50000;let last=0;while(!done&&Date.now()<end){if(Date.now()-last>5000){console.log('RESET WAIT',bot.entity.position,bot.health,'death',death,'spawn',respawned);last=Date.now();}await sleep(200);}
}finally{bot.removeListener('death',onDeath);bot.removeListener('spawn',onSpawn);bot.pathfinder.setGoal(null);bot.clearControlStates();if(bot.blockAt(bot.entity.position.floored())?.name==='water')bot.setControlState('jump',true);}
console.log('RESET RESULT',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));

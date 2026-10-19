function makePlayerDamageEvidence(bot,getPhase=()=>'',limit=8){
 let previous=bot.health,done=false,dropped=0;const rows=[];
 const xyz=p=>p?{x:p.x,y:p.y,z:p.z}:null;
 const snapshot=(event,prior)=>{const p=bot.entity.position,q=p.floored();const entities=Object.values(bot.entities).filter(e=>['ender_dragon','dragon_fireball','area_effect_cloud','enderman'].includes(e.name)).map(e=>({id:e.id,name:e.name,p:xyz(e.position),velocity:xyz(e.velocity),width:e.width,height:e.height}));const row={at:new Date().toISOString(),event,phase:getPhase(),priorHp:prior,hp:bot.health,p:xyz(p),velocity:xyz(bot.entity.velocity),ground:bot.entity.onGround,eyeHeight:bot.entity.eyeHeight,feet:bot.blockAt(q)?.name,head:bot.blockAt(q.offset(0,1,0))?.name,floor:bot.blockAt(q.offset(0,-1,0))?.name,entities};if(rows.length>=limit){rows.shift();dropped++;}rows.push(row);};
 const health=()=>{if(bot.health<previous)snapshot('healthLoss',previous);previous=bot.health;};
 const hurt=e=>{if(e===bot.entity)snapshot('playerHurt',previous);};bot.on('health',health);bot.on('entityHurt',hurt);
 return{stop(){if(!done){bot.removeListener('health',health);bot.removeListener('entityHurt',hurt);done=true;}return{rows:[...rows],dropped,listenersRemoved:done,limits:'Retained actual state at events, not proof of damage cause or no-event safety.'};}};
}


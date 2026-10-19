// Passive permitted public-state snapshots; no cause/phase inference or actions.
function makePlayerDamageEvidence(bot,getPhase=()=>'',limit=8){
 let previous=bot.health,done=false,dropped=0;const rows=[];
 const xyz=p=>p?{x:p.x,y:p.y,z:p.z}:null;
 const snapshot=(event,prior)=>{const p=bot.entity.position,q=p.floored();const all=Object.values(bot.entities),near=(name,n)=>all.filter(e=>e.name===name&&e.position).sort((a,b)=>Math.hypot(a.position.x-p.x,a.position.y-p.y,a.position.z-p.z)-Math.hypot(b.position.x-p.x,b.position.y-p.y,b.position.z-p.z)).slice(0,n);const entities=[...near('ender_dragon',1),...near('enderman',3),...near('dragon_fireball',2),...near('area_effect_cloud',2)].map(e=>({id:e.id,name:e.name,p:xyz(e.position),velocity:xyz(e.velocity),width:e.width,height:e.height}));const row={at:new Date().toISOString(),event,phase:getPhase(),priorHp:prior,hp:bot.health,p:xyz(p),velocity:xyz(bot.entity.velocity),ground:bot.entity.onGround,eyeHeight:bot.entity.eyeHeight,yaw:bot.entity.yaw,pitch:bot.entity.pitch,feet:bot.blockAt(q)?.name,head:bot.blockAt(q.offset(0,1,0))?.name,floor:bot.blockAt(q.offset(0,-1,0))?.name,entities};if(rows.length>=limit){rows.shift();dropped++;}rows.push(row);};
 const health=()=>{if(bot.health<previous)snapshot('healthLoss',previous);previous=bot.health;};
 const hurt=e=>{if(e===bot.entity)snapshot('playerHurt',previous);};bot.on('health',health);bot.on('entityHurt',hurt);
 return{mark:label=>snapshot('mark:'+label,previous),stop(){if(!done){bot.removeListener('health',health);bot.removeListener('entityHurt',hurt);done=true;}return{rows:[...rows],dropped,listenersRemoved:done,limits:'Retained actual state at events, not proof of damage cause or no-event safety.'};}};
}

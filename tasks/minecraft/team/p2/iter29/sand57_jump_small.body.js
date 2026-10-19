const route=[v(-11,50,-11),v(-11,50,-12),v(-10,51,-12),v(-9,52,-12),v(-8,53,-12),v(-7,54,-12),v(-6,55,-12)];
const evidence=makeDragonEvidence(bot);const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now(),events=[],rows=[];let phase='prepare',hazard=false,admitted=false,attacked=false,best=Infinity;let sandUp=0;
const dragon=()=>Object.values(bot.entities).find(e=>e.name==='ender_dragon');
const info=e=>e?{id:e.id,name:e.name,p:e.position.clone(),width:e.width,height:e.height}:null;
const boss=()=>Object.values(bot.bossBars||{}).map(b=>({health:b.health,title:String(b.title)}));
const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazard=true;events.push({event:'fireball',at:new Date().toISOString(),p:bot.entity.position.clone(),e:info(e)});if(phase==='prepare'){bot.clearControlStates();try{const r=bot.stopDigging();if(r?.catch)r.catch(()=>{});}catch{}}}};
const onHurt=e=>{if(e.name==='ender_dragon')events.push({event:'dragonHurt',at:new Date().toISOString(),e:info(e)});};
bot.on('entitySpawn',onSpawn);bot.on('entityHurt',onHurt);
function forward(l){guard.forward(l);if(hazard||Object.values(bot.entities).some(e=>(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48)||(e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7)))throw Error('actualhazard '+l);if(Date.now()-began>240000)throw Error('forward budget');}
const walkCheck=l=>guard.escape(l);
async function escapeWalk(){phase='escape';guard.beginEscape('shaftReturn');if(sandUp===0&&audit().every(x=>x.full)){await seal(true);return;}let stable=0;for(let k=0;k<36&&stable<3;k++){await sleep(1);guard.escape('sand actual stable landing');stable=bot.entity.onGround&&Math.abs(bot.entity.position.y-Math.round(bot.entity.position.y))<.03?stable+1:0;}if(stable<3)throw Error('sand stable landing failed');console.log('SAND_STABLE_LANDING',JSON.stringify(state()));for(let n=0;n<sandUp;n++){guard.escape('sand descent');const under=bot.entity.position.floored().offset(0,-1,0);if(bot.blockAt(under)?.name!=='sand')throw Error('sand return actual block');const f=await face(under);await bot.equip(bot.inventory.items().find(i=>i.name==='stone_shovel'),'hand');await bot.dig(bot.blockAt(under),'ignore',dirs[f.face]);await sleep(8);if(!bot.entity.onGround)throw Error('sand return landing');console.log('SAND_DOWN',JSON.stringify(state()));}const idx=await actualPreparedIndex(route,guard);if(idx>0){const r=route.slice(0,idx+1).reverse();let i=0;while(i<r.length-1){const dx=r[i+1].x-r[i].x,dz=r[i+1].z-r[i].z;let j=i+1;while(j<r.length-1&&r[j+1].x-r[j].x===dx&&r[j+1].z-r[j].z===dz)j++;await continuousWalkSegment(r.slice(i,j+1),guard);i=j;}}await flat(route[0].offset(.5,0,.5));if(count('sand')!==2)throw Error('sand reusable receipt');for(const dy of[0,1])await put(route[0].offset(0,dy,-1),'sand');console.log('SAND_DOOR_CURRENT',JSON.stringify({state:state(),faces:audit()}));await seal(true);}
try{
 if(bot.game.dimension!=='the_end'||bot.health!==10||count('snowball')!==1||!bot.entity.position.floored().equals(route[0])||!audit().every(x=>x.full))throw Error('sourcechanged');
 const pick=bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(!pick||pick.durabilityUsed>58)throw Error('pickbudget');admitted=true;console.log('CONTACT_SOURCE',JSON.stringify({state:state(),boss:boss()}));
 for(const q of route.slice(1)){
  await stepStair(q,true);forward('prepared step');
  for(const c of (q.y>bot.entity.position.y?[bot.entity.position.floored().offset(0,3,0),q.offset(0,2,0),q.offset(0,3,0)]:[]))if(!['air','cave_air'].includes(bot.blockAt(c)?.name)){await cut(c,['end_stone','basalt']);forward('returnheadroom');}
  await stepStair(q);forward('moved');
 }
 const q=route.at(-1);for(let y=57;y<=60;y++)if(!['air','cave_air'].includes(bot.blockAt(v(q.x,y,q.z))?.name)){await cut(v(q.x,y,q.z),['end_stone']);forward('new55 skylight');}if(count('sand')!==2)throw Error('sand funding');await pillar('sand');sandUp++;await pillar('sand');sandUp++;console.log('SAND_TWO_UP',JSON.stringify(state()));
 console.log('SHAFT_ACTUAL',JSON.stringify({state:state(),shaft:Array.from({length:8},(_,i)=>({p:q.offset(0,i,0),name:bot.blockAt(q.offset(0,i,0))?.name}))}));
 await bot.equip(bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');phase='watch';const t=Date.now();
 console.log('SMALL_JUMP_NO_ATTACK',JSON.stringify(state()));bot.setControlState('jump',true);try{for(let k=0;k<10;k++){await sleep(1);forward('small actual jump');if(k>=3)bot.setControlState('jump',false);}}finally{bot.setControlState('jump',false);}console.log('SMALL_JUMP_TO_ESCAPE',JSON.stringify(state()));

}catch(e){console.log('FAILURE',String(e),JSON.stringify({state:state(),phase,attacked,best}));}
finally{
 if(admitted)try{await escapeWalk();}catch(e){console.log('RECOVERY_FAILURE_IMMEDIATE',String(e),JSON.stringify(state()));try{await refuge();console.log('FALLBACK',JSON.stringify(state()));}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}
 for(let i=0;i<40&&bot.health>0;i++)await sleep(1);
 console.log('DRAGON_EVIDENCE',JSON.stringify(evidence.stop()));console.log('CONTACT_POST',JSON.stringify({at:new Date().toISOString(),state:state(),elapsedMs:Date.now()-began,attacked,best,rows,events,boss:boss()}));guard.close();bot.removeListener('entitySpawn',onSpawn);bot.removeListener('entityHurt',onHurt);console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

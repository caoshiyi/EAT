console.log('ENVIRONMENT SANDBOX G27-7 low58 ordinarymelee experiment wholebudget01:03–01:15; no fabricatedparts');
const route=[[-11,50,-11],[-12,50,-11],[-13,50,-11],[-14,50,-11],[-15,50,-11],[-15,51,-12],[-15,52,-13],[-15,53,-14],[-15,54,-15],[-15,55,-16],[-16,56,-16],[-17,57,-16],[-18,58,-16]].map(q=>v(...q));
const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now(),events=[],rows=[];let phase='prepare',escaping=false,hazard=false,admitted=false,attacked=false,peeked=false,minFuture=Infinity;
const realDragon=()=>Object.values(bot.entities).find(e=>e.name==='ender_dragon');
const info=e=>({id:e.id,name:e.name,p:e.position.clone(),velocity:e.velocity.clone(),width:e.width,height:e.height,metadata:[...e.metadata]});
const onHurt=e=>{if(e.name==='ender_dragon')events.push({at:new Date().toISOString(),event:'dragonHurt',entity:info(e)});};
const onBoss=b=>events.push({at:new Date().toISOString(),event:'bossBar',title:b.title,health:b.health});
const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazard=true;events.push({at:new Date().toISOString(),event:'fireball',p:bot.entity.position.clone(),projectile:{id:e.id,p:e.position.clone()}});if(!escaping&&phase!=='commit'){bot.clearControlStates();try{const r=bot.stopDigging();if(r?.catch)r.catch(()=>{});}catch{}}}};
bot.on('entityHurt',onHurt);bot.on('bossBarCreated',onBoss);bot.on('bossBarUpdated',onBoss);bot.on('entitySpawn',onSpawn);
function forward(label){guard.forward(label);if(Object.values(bot.entities).some(e=>(e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7)||(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<(phase==='commit'?6:48))))throw Error('actualhazard '+label);if(hazard&&phase!=='commit')throw Error('retiredfireball '+label);}
const walkCheck=l=>guard.escape(l);
async function escape(){escaping=true;guard.beginEscape('ordinarywalk');bot.clearControlStates();for(let k=0;k<24&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-Math.round(bot.entity.position.y))>.03);k++)await sleep(1);const q=bot.entity.position.floored(),i=route.findIndex(r=>r.equals(q));console.log('MELEE_ESCAPE_START',JSON.stringify({p:bot.entity.position,hp:bot.health,index:i}));if(i<0)throw Error('actualoffknownstairs');for(let k=i-1;k>=0;k--)await fastWalkStep(route[k]);await seal(true);}
function blockRay(point){const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),d=point.minus(eye);return bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm());}
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(route[0])||bot.health!==10||count('snowball')!==3)throw Error('actualmeleesourcechanged');admitted=true;console.log('MELEE_ACTUAL_START',JSON.stringify(state()));
 for(const q of route.slice(1))await stepStair(q);
 await put(bot.entity.position.floored().offset(0,2,0));forward('roofedtrench');
 const waitBegan=Date.now();for(let k=0;k<1200&&Date.now()-waitBegan<60000;k++){
  forward('roofedwait');const d=realDragon();if(!d)throw Error('dragonunloaded');const center=d.position.offset(0,d.height/2,0),eye=bot.entity.position.offset(0,bot.entity.eyeHeight+1.2522,0),future=center.plus(d.velocity.scaled(23)),distance=future.distanceTo(eye);minFuture=Math.min(minFuture,distance);
  if(k%20===0)rows.push({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,dragon:info(d),forecastCenterDistance:distance,actualCenterDistance:center.distanceTo(eye)});
  if(distance<2.8){console.log('MODEL_TRIGGER_ONLY',JSON.stringify({at:new Date().toISOString(),dragon:info(d),future,distance}));break;}await sleep(1);
 }
 const d=realDragon(),center=d.position.offset(0,d.height/2,0),future=center.plus(d.velocity.scaled(23)),futureEye=bot.entity.position.offset(0,bot.entity.eyeHeight+1.2522,0);
 if(future.distanceTo(futureEye)>=2.8)throw Error('nocrediblecentroidwindow minForecast '+minFuture);
 phase='commit';const commitBegan=Date.now();await cut(bot.entity.position.floored().offset(0,2,0),['end_stone']);forward('afterrealroofcut');await bot.equip(bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');
 bot.setControlState('jump',true);for(let k=0;k<9&&bot.entity.position.y<59.251;k++){await sleep(1);forward('meleejump');}bot.setControlState('jump',false);peeked=true;
 const current=realDragon(),point=current.position.offset(0,current.height/2,0),eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),distance=point.distanceTo(eye);
 if(distance>3||Date.now()-commitBegan>1800)throw Error('actualcentroidreach/window '+distance);const obstruction=blockRay(point);if(obstruction)throw Error('actualviewblocked '+obstruction.name);
 await bot.lookAt(point,true);await sleep(1);forward('beforeordinaryattack');const same=realDragon(),cursor=bot.entityAtCursor(3);if(!cursor||cursor!==same||same!==current||same.position.offset(0,same.height/2,0).distanceTo(bot.entity.position.offset(0,bot.entity.eyeHeight,0))>3||blockRay(same.position.offset(0,same.height/2,0)))throw Error('actualcursor/reach/viewrefused');
 console.log('ACTUAL_ORDINARY_MELEE',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,cursor:info(cursor),point,eye,distance}));bot.attack(cursor);attacked=true;await sleep(1);
}catch(e){console.log('FAILURE',String(e),JSON.stringify({at:new Date().toISOString(),state:state(),attacked,peeked,minFuture}));}
finally{
 bot.clearControlStates();if(admitted)try{await escape();}catch(e){console.log('RECOVERY_FAILURE',String(e),JSON.stringify(state()));}
 for(let k=0;k<20&&bot.health>0;k++)await sleep(5);
 console.log('MELEE_ACTUAL_POST',JSON.stringify({at:new Date().toISOString(),state:state(),elapsedMs:Date.now()-began,attacked,peeked,minFuture,events,rows,dragon:realDragon()?info(realDragon()):null}));
 bot.removeListener('entityHurt',onHurt);bot.removeListener('bossBarCreated',onBoss);bot.removeListener('bossBarUpdated',onBoss);bot.removeListener('entitySpawn',onSpawn);console.log('OPERATION_GUARD',JSON.stringify(guard.report()));guard.close();console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

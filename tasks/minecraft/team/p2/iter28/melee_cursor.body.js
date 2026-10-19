console.log('ENVIRONMENT G28-1 retained post-western89; ordinary real dragon cursor3 experiment; whole01:52–02:00');
const route=[[-11,50,-11],[-12,50,-11],[-13,50,-11],[-14,50,-11],[-15,50,-11],[-15,51,-12],[-15,52,-13],[-15,53,-14],[-15,54,-15],[-15,55,-16],[-16,56,-16],[-17,57,-16],[-18,58,-16]].map(q=>v(...q));
const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now(),events=[],rows=[];let phase='prepare',escaping=false,hazard=false,admitted=false,attacked=false,samples=0,best=Infinity;
const dragon=()=>Object.values(bot.entities).find(e=>e.name==='ender_dragon');
const info=e=>e?({id:e.id,name:e.name,p:e.position.clone(),velocity:e.velocity?.clone(),width:e.width,height:e.height}):null;
const onHurt=e=>{if(e.name==='ender_dragon')events.push({at:new Date().toISOString(),event:'dragonHurt',e:info(e)});};
const onBoss=b=>events.push({at:new Date().toISOString(),event:'bossBar',health:b.health,title:String(b.title),dragon:b.isDragonBar});
const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazard=true;events.push({at:new Date().toISOString(),event:'fireball',p:bot.entity.position.clone(),e:info(e)});if(!escaping&&phase==='prepare'){bot.clearControlStates();try{const r=bot.stopDigging();if(r?.catch)r.catch(()=>{});}catch{}}}};
bot.on('entityHurt',onHurt);bot.on('bossBarCreated',onBoss);bot.on('bossBarUpdated',onBoss);bot.on('entitySpawn',onSpawn);
function forward(label){guard.forward(label);if(hazard||Object.values(bot.entities).some(e=>(e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7)||(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48)))throw Error('actualhazard '+label);}
const walkCheck=l=>guard.escape(l);
const ray=point=>{const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),d=point.minus(eye);return d.norm()>.001?bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()-.01):null;};
function aimCandidate(d){const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),w=d.width/2,p=d.position;return v(Math.max(p.x-w+.02,Math.min(p.x+w-.02,eye.x)),Math.max(p.y+.02,Math.min(p.y+d.height-.02,eye.y)),Math.max(p.z-w+.02,Math.min(p.z+w-.02,eye.z)));}
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(route[0])||bot.health!==10||count('snowball')!==2||!audit().every(a=>a.full))throw Error('actualmeleesourcechanged');admitted=true;console.log('MELEE_ACTUAL_START',JSON.stringify(state()));
 for(const q of route.slice(1))await stepStair(q);
 await roofClose(bot.entity.position.floored());forward('roofedtrench');
 await bot.equip(bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');forward('equipped');
 const wait=Date.now();for(let k=0;k<400&&Date.now()-wait<20000;k++){
  forward('cursorwatch');const d=dragon();if(!d)throw Error('dragonunloaded');const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),point=aimCandidate(d),model=point.distanceTo(eye);best=Math.min(best,model);samples++;
  if(model<=3){await bot.lookAt(point,true);await sleep(1);forward('afteractualaim');const actual=dragon(),actualPoint=aimCandidate(actual),hit=ray(actualPoint),cursor=bot.entityAtCursor(3),nowEye=bot.entity.position.offset(0,bot.entity.eyeHeight,0);const row={at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,dragon:info(actual),aim:point,currentCandidate:actualPoint,modelDistance:actualPoint.distanceTo(nowEye),centerDistance:actual.position.offset(0,actual.height/2,0).distanceTo(nowEye),cursor:info(cursor),obstruction:hit?{p:hit.position,name:hit.name}:null};if(rows.length<8)rows.push(row);
   if(cursor===actual&&!hit&&actual===d&&actualPoint.distanceTo(nowEye)<=3){console.log('ACTUAL_ORDINARY_MELEE',JSON.stringify(row));forward('beforeordinaryattack');bot.attack(cursor);attacked=true;console.log('ORDINARY_ATTACK_RETURNED',new Date().toISOString());await sleep(1);break;}
  }else if(k%80===0&&rows.length<8)rows.push({at:new Date().toISOString(),dragon:info(d),modelDistance:model,reason:'candidate beyond3; no attack'});
  await sleep(1);
 }
 if(!attacked)console.log('NO_ELIGIBLE_CURSOR',JSON.stringify({samples,best}));
}catch(e){console.log('FAILURE',String(e),JSON.stringify({at:new Date().toISOString(),state:state(),attacked,best}));}
finally{
 escaping=true;phase='escape';bot.clearControlStates();if(admitted)try{await escapePreparedRoute(route,guard);}catch(e){console.log('RECOVERY_FAILURE_IMMEDIATE',String(e),JSON.stringify(state()));try{await refuge();}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}
 for(let k=0;k<20&&bot.health>0;k++)await sleep(5);
 console.log('MELEE_ACTUAL_POST',JSON.stringify({at:new Date().toISOString(),state:state(),elapsedMs:Date.now()-began,attacked,best,samples,events,rows,dragon:info(dragon())}));
 bot.removeListener('entityHurt',onHurt);bot.removeListener('bossBarCreated',onBoss);bot.removeListener('bossBarUpdated',onBoss);bot.removeListener('entitySpawn',onSpawn);console.log('OPERATION_GUARD',JSON.stringify(guard.report()));guard.close();console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

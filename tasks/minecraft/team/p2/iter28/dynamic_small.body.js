console.log('ENVIRONMENT G28-1 SMALL dynamic57step+apexjump, no attack; whole01:54–02:02');
const route=[[-11,50,-11],[-11,50,-12],[-10,51,-12],[-9,52,-12],[-8,53,-12],[-7,54,-12],[-6,55,-12],[-5,56,-12],[-4,57,-12]].map(q=>v(...q));
let bestRow=null;const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now(),events=[],rows=[];let phase='prepare',escaping=false,hazard=false,admitted=false,attacked=false,samples=0,best=Infinity;
const dragon=()=>Object.values(bot.entities).find(e=>e.name==='ender_dragon');
const info=e=>e?({id:e.id,name:e.name,p:e.position.clone(),velocity:e.velocity?.clone(),width:e.width,height:e.height}):null;
const onHurt=e=>{if(e.name==='ender_dragon')events.push({at:new Date().toISOString(),event:'dragonHurt',e:info(e)});};
const onBoss=b=>events.push({at:new Date().toISOString(),event:'bossBar',health:b.health,title:String(b.title),dragon:b.isDragonBar});
const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazard=true;events.push({at:new Date().toISOString(),event:'fireball',p:bot.entity.position.clone(),e:info(e)});if(!escaping&&phase==='prepare'){bot.clearControlStates();try{const r=bot.stopDigging();if(r?.catch)r.catch(()=>{});}catch{}}}};
bot.on('entityHurt',onHurt);bot.on('bossBarCreated',onBoss);bot.on('bossBarUpdated',onBoss);bot.on('entitySpawn',onSpawn);
function forward(label){guard.forward(label);if(hazard||Object.values(bot.entities).some(e=>(e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7)||(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48)))throw Error('actualhazard '+label);}
const walkCheck=l=>guard.escape(l);
const ray=point=>{const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),d=point.minus(eye);if(d.norm()<=.05)throw Error('degenerate aiming ray');return bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()-.01);};
function aimCandidate(d){const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),w=d.width/2,p=d.position;const nearest=v(Math.max(p.x-w+.02,Math.min(p.x+w-.02,eye.x)),Math.max(p.y+.02,Math.min(p.y+d.height-.02,eye.y)),Math.max(p.z-w+.02,Math.min(p.z+w-.02,eye.z)));return nearest.distanceTo(eye)>.05?nearest:d.position.offset(0,.2,0);}
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(route[0])||bot.health!==10||count('snowball')!==2||!audit().every(a=>a.full))throw Error('actualmeleesourcechanged');admitted=true;console.log('MELEE_ACTUAL_START',JSON.stringify(state()));
 for(const q of route.slice(1,-1))await stepStair(q);
 await stepStair(route.at(-1),true);forward('preparedfinalstep');await cut(route.at(-1).offset(0,2,0),['end_stone']);forward('preparedjumpheadroom');
 console.log('SMALL_DYNAMIC_PREPARED',JSON.stringify({state:state(),baseRoof:bot.blockAt(route.at(-2).offset(0,3,0))?.name,target:route.at(-1)}));
 await bot.equip(bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');
 phase='commit';await stepStair(route.at(-1));const baseY=bot.entity.position.y;bot.setControlState('jump',true);
 for(let k=0;k<9;k++){await sleep(1);forward('smallactualjump');const d=dragon();rows.push({at:new Date().toISOString(),p:bot.entity.position.clone(),ground:bot.entity.onGround,dragon:info(d)});if(bot.entity.position.y>=baseY+1.1)bot.setControlState('jump',false);}
 bot.setControlState('jump',false);console.log('SMALL_DYNAMIC_AIRBORNE',JSON.stringify({state:state(),samples:rows}));
 if(!attacked)console.log('NO_ELIGIBLE_CURSOR',JSON.stringify({samples,best}));
}catch(e){console.log('FAILURE',String(e),JSON.stringify({at:new Date().toISOString(),state:state(),attacked,best}));}
finally{
 escaping=true;phase='escape';bot.clearControlStates();if(admitted)try{await escapePreparedRoute(route,guard);}catch(e){console.log('RECOVERY_FAILURE_IMMEDIATE',String(e),JSON.stringify(state()));try{await refuge();}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}
 for(let k=0;k<20&&bot.health>0;k++)await sleep(5);
 console.log('MELEE_ACTUAL_POST',JSON.stringify({at:new Date().toISOString(),state:state(),elapsedMs:Date.now()-began,attacked,best,bestRow,samples,events,rows,dragon:info(dragon())}));
 bot.removeListener('entityHurt',onHurt);bot.removeListener('bossBarCreated',onBoss);bot.removeListener('bossBarUpdated',onBoss);bot.removeListener('entitySpawn',onSpawn);console.log('OPERATION_GUARD',JSON.stringify(guard.report()));guard.close();console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

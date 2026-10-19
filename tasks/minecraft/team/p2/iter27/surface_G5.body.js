console.log('ENVIRONMENT SANDBOX G27-5 NATURALground60 stair access, realfront-top sightline, oneSnow and WALKINGescape; tallcolumn retired');
const route=[[-11,50,-11],[-12,50,-11],[-13,50,-11],[-13,51,-12],[-14,52,-12],[-14,53,-13],[-15,54,-13],[-15,55,-14],[-16,56,-14],[-16,57,-15],[-17,58,-15],[-17,59,-16],[-18,60,-16]].map(q=>v(...q));
const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now(),oldIds=new Set(Object.keys(bot.entities).map(Number)),flight=[],events=[];
let escaping=false,hazardRetired=false,fired=false,admitted=false;
const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.x===-33.5&&e.position.z===-24.5);
const shotEntity=e=>({id:e.id,name:e.name,p:e.position?.clone(),velocity:e.velocity?.clone()});
const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazardRetired=true;events.push({at:new Date().toISOString(),event:'earlyfireball',player:bot.entity.position.clone(),e:shotEntity(e)});if(!escaping){bot.clearControlStates();bot.pathfinder.setGoal(null);try{const stopResult=bot.stopDigging();if(stopResult?.catch)stopResult.catch(()=>{});}catch{}}}if(e.name==='snowball'&&!oldIds.has(e.id))events.push({at:new Date().toISOString(),event:'snowspawn',e:shotEntity(e)});};
const onGone=e=>{if(e.id===target?.id||e.name==='snowball')events.push({at:new Date().toISOString(),event:'gone',e:shotEntity(e)});};
const onHurt=e=>{if(e.name==='ender_dragon')events.push({at:new Date().toISOString(),event:'dragonHurt',e:shotEntity(e)});};
bot.on('entitySpawn',onSpawn);bot.on('entityGone',onGone);bot.on('entityHurt',onHurt);
function forward(label){guard.forward(label);if(hazardRetired||Object.values(bot.entities).some(e=>e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48)||Object.values(bot.entities).some(e=>e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<9))throw Error('earlyactualhazard forwardretired '+label);}
function ray(point,h=bot.entity.eyeHeight){const eye=bot.entity.position.offset(0,h,0),d=point.minus(eye);return bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()-.02);}
const walkCheck=label=>guard.escape(label);
async function escapeWalk(){
 escaping=true;guard.beginEscape('walkretreat');const began=Date.now();
 for(let k=0;k<15&&!bot.entity.onGround;k++){guard.escape('actualsettle');await sleep(1);}
 const actual=bot.entity.position.floored(),index=route.findIndex(q=>q.equals(actual));
 console.log('ACTUAL_ESCAPE_START',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,index}));
 if(index<0)throw Error('escapedisplacedoffknownstairs');
 for(let k=index-1;k>=0;k--){guard.escape('nextknownstep');await fastWalkStep(route[k]);}
 console.log('ACTUAL_WALK_RETREAT',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,elapsedMs:Date.now()-began}));
 if(!bot.entity.onGround||!bot.entity.position.floored().equals(v(-11,50,-11)))throw Error('walkretreatgoal');await seal(true);
}
async function observeFlight(){for(let tick=0;tick<90;tick++){alive();for(const e of Object.values(bot.entities))if(e.name==='snowball'&&!oldIds.has(e.id)&&tick%2===0)flight.push({at:new Date().toISOString(),tick,...shotEntity(e)});await sleep(1);}}
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(-11,50,-11))||bot.health!==10||count('snowball')!==4||!target)throw Error('surface sourcechanged');admitted=true;console.log('SURFACE_ACTUAL_START',JSON.stringify(state()));forward('source');
 for(const q of route.slice(1))await stepStair(q);
 forward('standing');const visible=target.position.offset(.9,1.8,.9),aim=v(target.position.x,104.1004442868,target.position.z),rays=[];
 for(const h of[bot.entity.eyeHeight,1.8])for(const[n,point]of[['visibleFrontTop',visible],['outgoingSkyAim',aim]]){const hit=ray(point,h);rays.push({n,h,hit:hit?{p:hit.position,name:hit.name}:null});}
 if(rays.some(x=>x.hit))throw Error('ACTUALsurface rayrefused '+JSON.stringify(rays));await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');forward('afterequip');await bot.lookAt(aim,true);await sleep(1);forward('beforeactualSnow');
 console.log('ACTUAL_SURFACE_SHOT',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,target:shotEntity(target),visible,aim,rays}));bot.activateItem();fired=true;await sleep(1);bot.deactivateItem();
}catch(e){console.log('FAILURE',String(e),JSON.stringify({at:new Date().toISOString(),state:state(),fired,hazardRetired}));}
finally{
 bot.deactivateItem();if(admitted)try{const result=await Promise.allSettled([escapeWalk(),observeFlight()]);const failed=result.find(r=>r.status==='rejected');if(failed)throw failed.reason;}catch(e){console.log('RECOVERY_FAILURE',String(e),JSON.stringify(state()));}
 for(let i=0;i<20&&bot.health>0;i++)await sleep(5);
 console.log('SURFACE_ACTUAL_POST',JSON.stringify({at:new Date().toISOString(),elapsedMs:Date.now()-began,state:state(),fired,hazardRetired,flight,events,targetPresent:target?!!bot.entities[target.id]:null,crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(shotEntity)}));
 console.log('OPERATION_GUARD',JSON.stringify(guard.report()));guard.close();bot.removeListener('entitySpawn',onSpawn);bot.removeListener('entityGone',onGone);bot.removeListener('entityHurt',onHurt);console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

console.log('ENVIRONMENT G28-3 SOUTH92 natural58/R31.145 INITIALjump Snow model65.125 boost.42UNTESTED untilactualflight; prepared2step/reconciledcontinuousescape; whole02:47–02:57');
const route=[v(-11,50,-11)];for(let x=-12;x>=-16;x--)route.push(v(x,50,-11));for(let z=-10;z<=0;z++)route.push(v(-16,50,z));for(let k=1;k<=8;k++)route.push(v(-16,50+k,k));
const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),began=Date.now(),oldIds=new Set(Object.keys(bot.entities).map(Number)),flight=[],events=[];
let escaping=false,hazardRetired=false,fired=false,admitted=false,phase='prepare',commitStarted=0;
const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.x===-12.5&&e.position.z===39.5);
const shotEntity=e=>({id:e.id,name:e.name,p:e.position?.clone(),velocity:e.velocity?.clone()});
const onSpawn=e=>{if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48){hazardRetired=true;events.push({at:new Date().toISOString(),event:'earlyfireball',player:bot.entity.position.clone(),e:shotEntity(e)});if(!escaping&&phase==='prepare'){bot.clearControlStates();bot.pathfinder.setGoal(null);try{const stopResult=bot.stopDigging();if(stopResult?.catch)stopResult.catch(()=>{});}catch{}}}if(e.name==='snowball'&&!oldIds.has(e.id))events.push({at:new Date().toISOString(),event:'snowspawn',e:shotEntity(e)});};
const onGone=e=>{if(e.id===target?.id||e.name==='snowball')events.push({at:new Date().toISOString(),event:'gone',e:shotEntity(e)});};
const onHurt=e=>{if(e.name==='ender_dragon')events.push({at:new Date().toISOString(),event:'dragonHurt',e:shotEntity(e)});};
bot.on('entitySpawn',onSpawn);bot.on('entityGone',onGone);bot.on('entityHurt',onHurt);
function forward(label){
 guard.forward(label);const hazards=Object.values(bot.entities),balls=hazards.filter(e=>e.name==='dragon_fireball');
 if(hazards.some(e=>e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7))throw Error('actualnearcloud');
 if(phase==='prepare'&&(hazardRetired||balls.some(e=>e.position.distanceTo(bot.entity.position)<48)))throw Error('preparationactualfireball');
 if(phase==='commit'&&(Date.now()-commitStarted>3000||balls.some(e=>e.position.distanceTo(bot.entity.position)<6)))throw Error('committedjumpwindow/hazard');
}
function ray(point,h=bot.entity.eyeHeight){const eye=bot.entity.position.offset(0,h,0),d=point.minus(eye);return bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()-.02);}
const walkCheck=label=>guard.escape(label);
async function escapeWalk(){escaping=true;phase='escape';guard.beginEscape('eastcontinuousreturn');bot.clearControlStates();const idx=await actualPreparedIndex(route,guard);console.log('CONTINUOUS_ESCAPE_START',JSON.stringify({at:new Date().toISOString(),state:state(),idx}));if(idx>0){const reverse=route.slice(0,idx+1).reverse();let i=0;while(i<reverse.length-1){const dx=reverse[i+1].x-reverse[i].x,dz=reverse[i+1].z-reverse[i].z;let j=i+1;while(j<reverse.length-1&&reverse[j+1].x-reverse[j].x===dx&&reverse[j+1].z-reverse[j].z===dz)j++;await continuousWalkSegment(reverse.slice(i,j+1),guard);i=j;}}await seal(true);}
async function observeFlight(){const seen=new Set();for(let tick=0;tick<110;tick++){alive();for(const e of Object.values(bot.entities))if(e.name==='snowball'&&!oldIds.has(e.id)){const key=e.id+':'+e.position.toString();if(!seen.has(key)){seen.add(key);flight.push({at:new Date().toISOString(),tick,...shotEntity(e)});}}await sleep(1);}}
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(-11,50,-11))||bot.health!==10||count('snowball')!==2||!target)throw Error('surface sourcechanged');if(!audit().every(a=>a.full)||count('wooden_pickaxe')!==1||count('end_stone')<50)throw Error('actual east funding/caps');console.log('LIVE_ACTUAL_SOURCE_COMPARE',JSON.stringify(state()));console.log('ACTUAL_ROUTE_START_MAP',JSON.stringify(route.map(q=>({q,feet:bot.blockAt(q)?.name,head:bot.blockAt(q.offset(0,1,0))?.name,roof:bot.blockAt(q.offset(0,2,0))?.name,floor:bot.blockAt(q.offset(0,-1,0))?.name}))));admitted=true;console.log('SURFACE_ACTUAL_START',JSON.stringify(state()));forward('source');
 for(const q of route.slice(1,-2)){if(!full(q.offset(0,-1,0))){if(!full(q.offset(0,-2,0))){await put(q.offset(0,-2,0));forward('actualfundlower');}await put(q.offset(0,-1,0));forward('routeactualfunding');}await stepStair(q);}
 await stepStair(route.at(-2),true);forward('preparedfirstcommitstep');
 for(const q of[route.at(-1),route.at(-2).offset(0,2,0),route.at(-1).offset(0,1,0),route.at(-1).offset(0,2,0),route.at(-1).offset(0,3,0)]){if(!['air','cave_air'].includes(bot.blockAt(q)?.name)){await cut(q,['end_stone','basalt']);forward('actualtwo-step-preclear');}}
 for(const q of route.slice(-2))if(!full(q.offset(0,-1,0))||![q,q.offset(0,1,0)].every(c=>['air','cave_air'].includes(bot.blockAt(c)?.name)))throw Error('actualcommitpreparedgeometry');
 await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');forward('precommitequip');console.log('ACTUAL_PREPARED_TWO_STEP_ADMISSION',JSON.stringify(state()));
 phase='commit';commitStarted=Date.now();await stepStair(route.at(-2));await stepStair(route.at(-1));
 await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');forward('afterequip');
 const standEye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),dx=target.position.x-standEye.x,dz=target.position.z-standEye.z,R=Math.hypot(dx,dz),angle=65.125*Math.PI/180;
 const dummy=v(target.position.x,standEye.y+R*Math.tan(angle),target.position.z),direction=dummy.minus(standEye);const unit=direction.scaled(1/direction.norm());
 await bot.lookAt(dummy,true);await sleep(1);forward('jumpprime');const yaw=bot.entity.yaw,pitch=bot.entity.pitch,baseY=bot.entity.position.y;
 bot.setControlState('jump',true);
 for(let k=0;k<9&&bot.entity.position.y<baseY+.40;k++){await sleep(1);forward('committedjump');}
 bot.setControlState('jump',false);forward('airborneactual');
 const air=bot.entity.position.clone();if(air.y<58.40||air.y>58.44||Math.abs(bot.entity.yaw-yaw)>1e-6||Math.abs(bot.entity.pitch-pitch)>1e-6)throw Error('actualjumpheight/camera');
 const visible=target.position.offset(-.95,1.95,-.95),outgoing=air.offset(0,bot.entity.eyeHeight,0).plus(unit.scaled(35)),rays=[];
 for(const h of[bot.entity.eyeHeight,1.8])for(const[n,point]of[['visibleFrontTop',visible],['actualOutgoingDirection',outgoing]]){const hit=ray(point,h);rays.push({n,h,hit:hit?{p:hit.position,name:hit.name}:null});}
 if(rays.some(x=>x.hit))throw Error('ACTUALjump rayrefused '+JSON.stringify(rays));forward('beforeactualSnow');
 console.log('ACTUAL_SURFACE_SHOT',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,velocity:bot.entity.velocity.clone(),hp:bot.health,target:shotEntity(target),visible,dummy,outgoing,yaw,pitch,rays,phase,commitElapsedMs:Date.now()-commitStarted}));
 bot.activateItem();fired=true;await sleep(1);bot.deactivateItem();

}catch(e){console.log('FAILURE',String(e),JSON.stringify({at:new Date().toISOString(),state:state(),fired,hazardRetired}));}
finally{
 bot.deactivateItem();if(admitted){const watching=observeFlight().catch(e=>console.log('FLIGHT_OBSERVER_STOP',String(e)));try{await escapeWalk();}catch(e){console.log('RECOVERY_FAILURE_IMMEDIATE',String(e),JSON.stringify(state()));try{await refuge();console.log('ACTUAL_REFUGE_FALLBACK',JSON.stringify(state()));}catch(f){console.log('RECOVERY_FAILURE',String(f),JSON.stringify(state()));}}await watching;}
 for(let i=0;i<20&&bot.health>0;i++)await sleep(5);
 console.log('SURFACE_ACTUAL_POST',JSON.stringify({at:new Date().toISOString(),elapsedMs:Date.now()-began,state:state(),fired,hazardRetired,flight,events,targetPresent:target?!!bot.entities[target.id]:null,crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(shotEntity)}));
 console.log('OPERATION_GUARD',JSON.stringify(guard.report()));guard.close();bot.removeListener('entitySpawn',onSpawn);bot.removeListener('entityGone',onGone);bot.removeListener('entityHurt',onHurt);console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

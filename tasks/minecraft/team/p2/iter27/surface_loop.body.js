console.log('ENVIRONMENT SANDBOX G27-8 FIRST actualcontinuoussurfaceloop10m+10m+return; noattack/noSnow');
const route=[[-11,50,-11],[-12,50,-11],[-13,50,-11],[-14,50,-11],[-15,50,-11],[-15,51,-12],[-15,52,-13],[-15,53,-14],[-15,54,-15],[-15,55,-16],[-16,56,-16],[-17,57,-16],[-18,58,-16],[-19,59,-16],[-20,60,-16]].map(q=>v(...q));
const guard=makeOperationGuard(bot),trace=makeHazardRecorder(bot),events=[],started=Date.now();let phase='prepare',admitted=false,escaping=false,hazard=false;
const spawn=e=>{if(['dragon_fireball','area_effect_cloud'].includes(e.name)){events.push({at:new Date().toISOString(),event:'spawn',name:e.name,id:e.id,p:e.position.clone(),body:bot.entity.position.clone(),hp:bot.health});if(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48)hazard=true;}};
bot.on('entitySpawn',spawn);
function forward(l){guard.forward(l);if(phase==='prepare'&&(hazard||Object.values(bot.entities).some(e=>(e.name==='area_effect_cloud'&&e.position.distanceTo(bot.entity.position)<7)||(e.name==='dragon_fireball'&&e.position.distanceTo(bot.entity.position)<48))))throw Error('preparationhazard '+l);}
const walkCheck=l=>guard.escape(l);
const topAt=(x,z)=>{for(let y=72;y>=45;y--)if(full(v(x,y,z)))return v(x,y+1,z);throw Error('loadednaturalfloorabsent '+x+','+z);};
async function surfaceTravel(q,budget=14000){
 const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=true;m.scafoldingBlocks=[];m.maxDropDown=2;m.exclusionAreasStep.push(b=>['water','lava'].includes(b.name)||Object.values(bot.entities).some(e=>e.name==='area_effect_cloud'&&e.position.distanceTo(b.position)<4)?100:0);bot.pathfinder.setMovements(m);const goal=new goals.GoalBlock(q.x,q.y,q.z),began=Date.now();let last=bot.entity.position.clone(),progress=Date.now();bot.pathfinder.setGoal(goal);
 try{while(!goal.isEnd(bot.entity.position.floored())&&Date.now()-began<budget){await sleep(2);if(escaping)guard.escape('surfacemove');else forward('surfacemove');if(bot.entity.position.distanceTo(last)>.35){last=bot.entity.position.clone();progress=Date.now();}if(Date.now()-progress>2200)throw Error('actualsurfacestalled');}}
 finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}await sleep(3);if(!goal.isEnd(bot.entity.position.floored())||!bot.entity.onGround)throw Error('actualsurfacegoalabsent');console.log('ACTUAL_SURFACE_MOVE',JSON.stringify({at:new Date().toISOString(),target:q,p:bot.entity.position,hp:bot.health,elapsedMs:Date.now()-began}));
}
async function retreat(){escaping=true;guard.beginEscape('surfaceandstairreturn');bot.pathfinder.setGoal(null);bot.clearControlStates();const q=bot.entity.position.floored();let idx=route.findIndex(r=>r.equals(q));if(idx<0){await surfaceTravel(route.at(-1),20000);idx=route.length-1;}for(let k=idx-1;k>=0;k--){const q=route[k],a=bot.entity.position.floored();for(const c of[q.offset(0,1,0),q,...(q.y<a.y?[q.offset(0,2,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(c)?.name))await cut(c,['end_stone','basalt']);await fastWalkStep(q);}await seal(true);}
try{
 if(bot.game.dimension!=='the_end'||bot.health!==10||count('snowball')!==3||!bot.entity.position.floored().equals(route[0]))throw Error('surfacefreshsource');admitted=true;console.log('SURFACE_LOOP_START',JSON.stringify(state()));
 for(const q of route.slice(1,13))await stepStair(q);await stepStair(route[13],true);phase='moving';for(const q of route.slice(13)){if(!full(q.offset(0,-1,0))){await put(q.offset(0,-1,0));forward('realexitfloor');}await stepStair(q);}
 await surfaceTravel(topAt(-23,-5));await surfaceTravel(topAt(-13,-5));await surfaceTravel(route.at(-1));
}catch(e){console.log('FAILURE',String(e),JSON.stringify({at:new Date().toISOString(),state:state(),phase}));}
finally{
 if(admitted)try{await retreat();}catch(e){console.log('RECOVERY_FAILURE',String(e),JSON.stringify(state()));}
 for(let n=0;n<20&&bot.health>0;n++)await sleep(5);console.log('SURFACE_LOOP_POST',JSON.stringify({at:new Date().toISOString(),state:state(),phase,elapsedMs:Date.now()-started,events}));bot.removeListener('entitySpawn',spawn);console.log('OPERATION_GUARD',JSON.stringify(guard.report()));guard.close();console.log('HAZARD_TRACE',JSON.stringify(trace.stop()));stop();
}return state();

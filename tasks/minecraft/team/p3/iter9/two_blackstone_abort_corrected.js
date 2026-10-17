const {Vec3}=require('vec3');
const start=Date.now(), workEnd=start+12000, hardEnd=start+32000, home=new Vec3(1,66,6), cut=new Vec3(0,66,6);
const resource=new Vec3(0,66,5);
const dim=bot.game.dimension, hp0=bot.health;let hurt=false,discontinuity=false,issue=null,opened=false,log=[];
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0), before=count('blackstone');
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')&&!/lava|fire|water|magma/.test(bot.blockAt(q).name);
const faces=[home.offset(0,-1,0),home.offset(0,2,0),...[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[0,1].map(y=>home.offset(x,y,z)))];
const stamp=s=>log.push([Date.now()-start,s,{x:bot.entity.position.x,y:bot.entity.position.y,z:bot.entity.position.z},bot.health]);
function stop(){try{bot.clearControlStates();}catch(e){log.push(['clear_error',e.message]);}try{bot.pathfinder.setGoal(null);}catch(e){log.push(['goal_error',e.message]);}}
function guard(recovery=false){if(discontinuity||bot.game.dimension!==dim||bot.health<=0||bot.entity.position.distanceTo(new Vec3(1.406,66,6.70))>.4)throw Error('DISCONTINUITY_OR_BODY');if(Date.now()>(recovery?hardEnd:workEnd))throw Error('DEADLINE');if(!recovery&&(hurt||bot.health<hp0))throw Error('HIT_STOP');}
const onHurt=e=>{if(e===bot.entity){hurt=true;stop();try{bot.stopDigging();}catch{}}},onDeath=()=>{discontinuity=true;stop();};bot.on('entityHurt',onHurt);bot.on('death',onDeath);
const timer=setTimeout(()=>{hurt=true;stop();try{bot.stopDigging();}catch{}},12000);
try{
 stop();guard();if(dim!=='the_nether'||!bot.entity.onGround||!faces.every(full))throw Error('START_NOT_FULL');if(bot.blockAt(cut)?.name!=='dirt'||bot.blockAt(resource)?.name!=='blackstone')throw Error('WRONG_CUT');if(!full(cut.offset(-1,0,0))||!full(cut.offset(0,1,0))||!full(resource.offset(1,0,0)))throw Error('BACKING_OR_REF_OPEN');if(count('dirt')<2)throw Error('NO_CAP');
 await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_pickaxe'),'hand');guard();stamp('WORK_BEGIN');if(Date.now()+bot.digTime(bot.blockAt(cut))+bot.digTime(bot.blockAt(resource))+3000>workEnd)throw Error('INSUFFICIENT_WORK_BUDGET');await bot.dig(bot.blockAt(cut),true);guard();opened=bot.blockAt(cut)?.name==='air';await bot.dig(bot.blockAt(resource),true);guard();await bot.waitForTicks(15);guard();stamp('WORK_DONE_FORCE_ABORT');throw Error('CONTROLLED_ABORT_AFTER_RESOURCE');
}catch(e){issue=e.message;stop();stamp('RECOVERY_BEGIN');}
finally{
 clearTimeout(timer);stop();
 try{guard(true);for(const [q,r] of [[resource,resource.offset(1,0,0)],[cut,cut.offset(0,1,0)]])if(bot.blockAt(q)?.name==='air'){if(!full(r))throw Error('CAP_REF_NOT_FULL');await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');guard(true);await bot._placeBlockWithOptions(bot.blockAt(r),q.minus(r),{forceLook:true});guard(true);await bot.waitForTicks(3);guard(true);if(!full(q))throw Error('CAP_NO_ACK');}stamp('RECOVERY_DONE');}catch(e){log.push(['RECOVERY_FAILED',e.message]);}
 stop();bot.removeListener('entityHurt',onHurt);bot.removeListener('death',onDeath);
}
return {issue,opened,log,elapsed:Date.now()-start,delta:count('blackstone')-before,inventory:bot.inventory.items().map(i=>[i.name,i.count]),full:faces.every(full),ground:bot.entity.onGround,p:bot.entity.position,hp:bot.health,food:bot.food,discontinuity,controls:bot.controlState};

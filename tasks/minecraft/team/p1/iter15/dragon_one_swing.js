// Selected actual caller: one stationary, ordinary attack of a loaded dragon entity.
// No artificial part IDs, movement, target pursuit, inferred kill or automatic retry.
const {Vec3}=require('vec3');
const start=Date.now(),self=bot.entity,hp0=bot.health,deadline=1792250260000;
let issue=null,lost=false,swings=0,trace=[],targetId=null;
const stop=()=>{bot.clearControlStates();bot.pathfinder.setGoal(null)};
stop();
const bars=()=>bot.bossBars.map(b=>({uuid:b.entityUUID,health:b.health,title:String(b.title)}));
const state=e=>({id:e.id,name:e.name,p:e.position.toArray(),hp:e.metadata?.[9],metadata:JSON.parse(JSON.stringify(e.metadata)),height:e.height,width:e.width});
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
function die(){lost=true;stop()}
function hurt(e){if(e?.id===targetId||e?.id===self.id)trace.push(['HURT',Date.now()-start,e.id,e.metadata?.[9]])}
function bar(b){trace.push(['BOSS',Date.now()-start,b.health,String(b.title)])}
for(const ev of ['death','respawn','end'])bot.on(ev,die);
bot.on('entityHurt',hurt);bot.on('bossBarUpdated',bar);
function check(){if(lost||bot.entity!==self||bot.game.dimension!=='the_end'||bot.health<=0)throw Error('LIFE_CHANGED');if(Date.now()>deadline-5000||Date.now()-start>12000)throw Error('TIME');if(bot.health<hp0)throw Error('DAMAGE_END');if(!bot.entity.onGround)throw Error('NOT_GROUNDED');if(bot.entity.position.distanceTo(origin)>.25)throw Error('DISPLACED')}
const origin=bot.entity.position.clone();
function target(){
 check();const e=bot.entities[targetId];if(!e||e.name!=='ender_dragon')throw Error('TARGET_GONE');
 const eye=bot.entity.position.offset(0,1.62,0),aim=e.position.offset(0,.5,0),d=aim.minus(eye);
 // Conservative root-point reach: does not infer an unseen multipart hit box.
 if(d.norm()>2.9)throw Error('ROOT_OUT_OF_REACH');
 if(bot.world.raycast(eye,d.unit(),Math.max(0,d.norm()-.15)))throw Error('BLOCKED_REACH');
 if(Object.values(bot.entities).some(x=>x.name==='area_effect_cloud'&&x.position.distanceTo(bot.entity.position)<8))throw Error('CLOUD_NEAR');
 return {e,aim};
}
try{
 if(bot.game.dimension!=='the_end')throw Error('ACTUAL_END_REQUIRED');
 if(hp0<16||bot.food<6||!full(bot.entity.position.floored().offset(0,-1,0)))throw Error('BODY_PRECONDITION');
 const dragon=Object.values(bot.entities).filter(e=>e.name==='ender_dragon').sort((a,b)=>a.position.distanceTo(origin)-b.position.distanceTo(origin))[0];
 if(!dragon)throw Error('DRAGON_NOT_LOADED');targetId=dragon.id;
 const sword=bot.inventory.items().find(i=>['stone_sword','iron_sword','diamond_sword'].includes(i.name));if(!sword)throw Error('SWORD_REQUIRED');
 target();await bot.equip(sword,'hand');await bot.waitForTicks(14);
 const {e,aim}=target();trace.push(['BEFORE',state(e),bars(),bot.health]);await bot.lookAt(aim,true);target();bot.attack(e);swings++;
 for(let n=0;n<12;n++){await bot.waitForTicks(1);check()}
 const after=bot.entities[targetId];trace.push(['AFTER',after?state(after):null,bars(),bot.health]);
}catch(e){issue=e.message;trace.push(['ISSUE',issue])}
finally{stop();for(const ev of ['death','respawn','end'])bot.removeListener(ev,die);bot.removeListener('entityHurt',hurt);bot.removeListener('bossBarUpdated',bar)}
return {issue,swings,lost,trace,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,world:bot.game.dimension,onGround:bot.entity.onGround,below:bot.blockAt(bot.entity.position.floored().offset(0,-1,0))?.name,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

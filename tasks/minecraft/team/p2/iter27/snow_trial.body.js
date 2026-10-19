console.log('ENVIRONMENT SANDBOX G27-1 one ordinary compensated snowball; target visibility and outgoing aperture qualified from ACTUAL stance');
const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&Math.abs(e.position.x+33.5)<.1&&Math.abs(e.position.z+24.5)<.1),tracks=[],events=[],beforeIds=new Set(Object.keys(bot.entities).map(Number));let fired=false,cleared=false,recapped=false;
const shotSnapshot=e=>({id:e.id,name:e.name,p:e.position.clone(),velocity:e.velocity?.clone()});
const spawn=e=>{if(e.name==='snowball'&&!beforeIds.has(e.id))events.push({event:'spawn',at:new Date().toISOString(),e:shotSnapshot(e)});};
const gone=e=>{if(e.id===target?.id||e.name==='snowball')events.push({event:'gone',at:new Date().toISOString(),e:shotSnapshot(e)});};
const health=()=>console.log('HEALTH',JSON.stringify({state:state(),hazards:hazards()}));
function ray(point,height=bot.entity.eyeHeight){const eye=bot.entity.position.offset(0,height,0),d=point.minus(eye);return bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()-.02);}
async function openLocal(point){for(let k=0;k<5;k++){const hit=ray(point);if(!hit)return;const q=hit.position,a=bot.entity.position.floored();if(q.distanceTo(a)>3.8||q.y<a.y+1||!['end_stone','basalt'].includes(hit.name))throw Error('external obstruction '+JSON.stringify({q,name:hit.name}));console.log('LOCAL_APERTURE_CUT',q,hit.name);await cut(q,[hit.name]);}if(ray(point))throw Error('bounded aperture insufficient');}
bot.on('entitySpawn',spawn);bot.on('entityGone',gone);bot.on('health',health);
try{
 if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(-11,68,-11))||bot.health<10||count('snowball')!==4||!target)throw Error('shot sourcechanged');
 if(hazards().some(e=>e.name==='area_effect_cloud'&&e.p.distanceTo(bot.entity.position)<10))throw Error('nearbycloud');
 const visible=target.position.offset(0,1.8,0),aim=v(target.position.x,101.0850026143,target.position.z);
 await openLocal(visible);await openLocal(aim);
 const rays=[];for(const h of[bot.entity.eyeHeight,1.8])for(const [name,point]of[['crystalTop',visible],['outgoing',aim]]){const hit=ray(point,h);rays.push({name,h,hit:hit?{p:hit.position,name:hit.name}:null});}
 if(rays.some(r=>r.hit))throw Error('actualvisible/outgoing ray refused '+JSON.stringify(rays));
 await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');await bot.lookAt(aim,true);await sleep(2);
 console.log('SHOT_PRE',JSON.stringify({state:state(),target:shotSnapshot(target),visiblePoint:visible,aim,rays,hazards:hazards()}));
 bot.activateItem();fired=true;await sleep(1);bot.deactivateItem();
 for(let tick=0;tick<85;tick++){
   alive();const balls=Object.values(bot.entities).filter(e=>e.name==='snowball'&&!beforeIds.has(e.id));
   for(const e of balls){if(tick%2===0)tracks.push({tick,at:new Date().toISOString(),...shotSnapshot(e),targetDistance:e.position.distanceTo(target.position)});if(e.position.distanceTo(bot.entity.position)>5)cleared=true;}
   if(cleared&&!recapped){await roofClose(bot.entity.position.floored());recapped=full(bot.entity.position.floored().offset(0,2,0));console.log('PROJECTILE_CLEAR_RECAP',JSON.stringify({tick,state:state(),recapped}));}
   if(bot.health<10)throw Error('shot HPchanged');await sleep(1);
 }
 console.log('SHOT_POST',JSON.stringify({state:state(),fired,cleared,recapped,tracks,events,targetPresent:!!bot.entities[target.id],crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(shotSnapshot)}));
}catch(e){console.log('FAILURE',String(e),JSON.stringify({state:state(),fired,cleared,recapped,tracks,events,targetPresent:target?!!bot.entities[target.id]:null}));}
finally{
 bot.deactivateItem();bot.removeListener('entitySpawn',spawn);bot.removeListener('entityGone',gone);bot.removeListener('health',health);
 try{alive();for(let k=0;k<4;k++){const a=bot.entity.position.floored();if(!full(a.offset(0,-2,0)))throw Error('retreatsupport');await cut(a.offset(0,-1,0),['end_stone','basalt']);await sleep(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y+1)>.03)throw Error('retreatpostcondition');}await seal();console.log('SHOT_RETAINED',JSON.stringify(state()));}catch(e){console.log('RECOVERY_FAILURE',String(e),JSON.stringify(state()));}
 stop();
}return state();

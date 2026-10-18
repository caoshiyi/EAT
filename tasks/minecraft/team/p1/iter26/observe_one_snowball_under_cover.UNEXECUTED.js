// REVIEW LIMIT P4 23:37: owner callback must observe projectile cleared future cap volume before recap,
// or report early self-obstruction. One tick is NOT demonstrated clearance; no flight-speed assumption.
// UNEXECUTED proposal, derived from P3 public API observer. Local syntax checked only.
// Owner supplies afterLaunch legal recap; callback return is NOT proof of full shelter.
// No move/throw/placement occurs merely by defining this function.
// Function only: owner includes/calls after own small harvest/stance qualification.
// UNEXECUTED. Public Mineflayer API; no assumed projectile physics or proxy entities.
async function observeOneSnowballUnderCover({aim, targetCrystalId=null, maxTicks=80, afterLaunch}) {
  if(typeof afterLaunch!=="function"||!Number.isInteger(maxTicks)||maxTicks<1||maxTicks>80)throw Error("need one owner recap callback and bounded1..80tick observation");
  const V=bot.entity.position.constructor;
  aim=new V(aim.x,aim.y,aim.z);
  const count=()=>bot.inventory.items().filter(i=>i.name==='snowball').reduce((n,i)=>n+i.count,0);
  const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dimension:bot.game.dimension,ground:bot.entity.onGround,inventorySnowballs:count(),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),goal:!!bot.pathfinder.goal,window:!!bot.currentWindow});
  const before=state(),startPos=bot.entity.position.clone(),dim=bot.game.dimension;
  if(!before.ground||before.hp<=0||before.goal||before.window||Object.values(before.controls).some(Boolean)||count()<1) throw Error('projectile admission: need alive idle supported funded stance');
  const target=targetCrystalId===null?null:bot.entities[targetCrystalId];
  if(targetCrystalId!==null&&target?.name!=='end_crystal') throw Error('need current actual end_crystal, not proxy');
  if(target&&aim.distanceTo(target.position.offset(0,.65,0))>.05) throw Error('owner must aim at observed crystal +.65, not stale coordinates');
  await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');
  await bot.lookAt(aim,true); await bot.waitForTicks(2);
  const rays=[bot.entity.eyeHeight,1.8].map(h=>{const eye=bot.entity.position.offset(0,h,0),d=aim.minus(eye),hit=bot.world.raycast(eye,d.scaled(1/d.norm()),Math.max(.01,d.norm()-.02));return {h,d:d.norm(),hit:hit?{p:hit.position,n:hit.name}:null};});
  // Local smoke may aim at the visible wall itself; no intervening block is allowed.
  if(rays.some(r=>r.hit&&(!target&&r.hit.p.equals(aim.floored())?false:true))) throw Error('projectile aim is occluded '+JSON.stringify(rays));
  const ids=new Set(Object.keys(bot.entities).map(Number)),tracks=new Map(),events=[];
  const snapshot=e=>({id:e.id,name:e.name,type:e.type,p:e.position?.clone(),velocity:e.velocity?.clone()});
  const spawn=e=>{if(e.position?.distanceTo(startPos)<8) events.push({kind:'spawn',at:new Date().toISOString(),entity:snapshot(e)});if(e.name==='snowball'&&!ids.has(e.id))tracks.set(e.id,[]);};
  const gone=e=>{if(tracks.has(e.id)||e.id===targetCrystalId)events.push({kind:'gone',at:new Date().toISOString(),entity:snapshot(e)});};
  bot.on('entitySpawn',spawn);bot.on('entityGone',gone);
  let failure=null;
  try {
    console.log('PROJECTILE_PRE',JSON.stringify({before,aim,target:target?snapshot(target):null,rays}));
    bot.activateItem();await bot.waitForTicks(1);bot.deactivateItem();
    await afterLaunch(); // Owner qualifies actual placement/receipt; callback runs exactly once.
    console.log('PROJECTILE_AFTER_RECAP',JSON.stringify(state()));
    for(let tick=0;tick<maxTicks;tick++){
      if(bot.health<before.hp||bot.health<=0||bot.game.dimension!==dim||bot.entity.position.distanceTo(startPos)>.25)throw Error('projectile trial life/dimension/stance changed');
      for(const e of Object.values(bot.entities))if(e.name==='snowball'&&!ids.has(e.id)){
        if(!tracks.has(e.id))tracks.set(e.id,[]);
        if(tick%2===0)tracks.get(e.id).push({tick,at:new Date().toISOString(),...snapshot(e),targetDistance:target?e.position.distanceTo(target.position):null});
      }
      await bot.waitForTicks(1);
    }
  } catch(e){failure=String(e);}
  finally {bot.deactivateItem();bot.removeListener('entitySpawn',spawn);bot.removeListener('entityGone',gone);}
  const after=state(),result={before,after,inventoryDelta:after.inventorySnowballs-before.inventorySnowballs,events,tracks:[...tracks].map(([id,samples])=>({id,samples})),targetPresent:targetCrystalId===null?null:!!bot.entities[targetCrystalId],currentCrystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(snapshot),failure};
  console.log('PROJECTILE_POST',JSON.stringify(result));
  // Caller owns actual shelter/retreat, additional absence samples and live evaluator.
  return result;
}

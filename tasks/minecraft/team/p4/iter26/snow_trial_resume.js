const V=bot.entity.position.constructor,v=(x,y,z)=>new V(x,y,z),s=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),ground:bot.entity.onGround,goal:bot.pathfinder.goal}),full=p=>bot.blockAt(p)?.shapes?.some(x=>x.join(',')==='0,0,0,1,1,1');const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);let dead=false;const died=()=>{dead=true;bot.clearControlStates();bot.pathfinder.setGoal(null)};bot.on('death',died);const alive=()=>{if(dead||bot.health<=0||bot.game.dimension!=='overworld')throw Error('life');};const ds=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)],ofs=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
async function face(p,f=null){for(const a of[[.5,.5,.5],[.5,.01,.5],[.5,.99,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99]]){await bot.lookAt(p.offset(...a),true);const c=bot.blockAtCursor(4.5);if(c?.position.equals(p)&&(f===null||c.face===f))return c;}throw Error('no face '+p);}
async function cut(p,allowed){alive();if(!allowed.includes(bot.blockAt(p)?.name))throw Error('material '+p);await face(p);await bot.unequip('hand');await bot.dig(bot.blockAt(p),false,'raycast');await bot.waitForTicks(8);if(bot.blockAt(p)?.shapes.length)throw Error('not cut');console.log('CUT',JSON.stringify({p,s:s()}));}
async function put(p){if(full(p))return;for(const f of[0,1,3,5,4,2]){const ref=p.minus(ds[f]);if(!full(ref))continue;try{await face(ref,f)}catch(e){continue}const i=bot.inventory.items().find(i=>['dirt','spruce_planks'].includes(i.name));if(!i)throw Error('no cap');await bot.equip(i,'hand');await bot.placeBlock(bot.blockAt(ref),ds[f]);await bot.waitForTicks(5);if(!full(p))throw Error('cap not full');console.log('PUT',p);return}throw Error('no anchor '+p)}
async function go(p){alive();const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.maxDropDown=1;m.infiniteLiquidDropdownDistance=false;bot.pathfinder.setMovements(m);const g=new goals.GoalBlock(p.x,p.y,p.z),r=bot.pathfinder.getPathTo(m,g,1500);console.log('PLAN',JSON.stringify({p,status:r.status,path:r.path?.map(n=>[n.x,n.y,n.z])}));if(r.status!=='success')throw Error('no completeplan');const t=Date.now();bot.pathfinder.setGoal(g);try{while(bot.pathfinder.goal&&Date.now()-t<12000){alive();if(bot.health<16)throw Error('hpstop');await bot.waitForTicks(1)}}finally{bot.pathfinder.setGoal(null);bot.clearControlStates()}await bot.waitForTicks(8);if(!bot.entity.onGround||!bot.entity.position.floored().equals(p))throw Error('not arrived');console.log('ARRIVE',JSON.stringify(s()))}

// Function only: owner includes/calls after own small harvest/stance qualification.
// UNEXECUTED. Public Mineflayer API; no assumed projectile physics or proxy entities.
async function observeOneSnowball({aim, targetCrystalId=null, maxTicks=80}) {
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
    for(let tick=0;tick<maxTicks;tick++){
      if(bot.health<=0||bot.game.dimension!==dim||bot.entity.position.distanceTo(startPos)>.25)throw Error('projectile trial life/dimension/stance changed');
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

async function craftOne(n,t=null){alive();if(bot.currentWindow)bot.closeWindow(bot.currentWindow);for(let k=1;k<=4;k++)if(bot.inventory.slots[k])await bot.putAway(k);const pre=count(n),r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,t)[0];if(!r)throw Error('unfunded '+n);if(t)await face(t.position);await bot.craft(r,1,t);await bot.waitForTicks(8);if(bot.currentWindow)bot.closeWindow(bot.currentWindow);console.log('CRAFT',JSON.stringify({n,pre,s:s()}));if(count(n)!==pre+r.result.count)throw Error('craftdelta '+n);}
const home=v(4,66,-21),roof=home.offset(0,2,0),door=home.offset(0,1,-1);bot.clearControlStates();bot.pathfinder.setGoal(null);let changed=false;
try{console.log('RESUME_AFTER_RETURN_FAILURE',JSON.stringify(s()));changed=true;const nr=v(4,68,-22);console.log('FRESH_HEADROOM',bot.blockAt(nr)?.name);if(bot.blockAt(nr)?.name==='spruce_leaves')await cut(nr,['spruce_leaves']);if(count('spruce_log')<2)throw Error('lostnewlogs');await go(home);await craftOne('spruce_planks');await craftOne('spruce_planks');await craftOne('crafting_table');const ref=home.offset(1,2,0);await face(ref,4);await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');await bot.placeBlock(bot.blockAt(ref),v(-1,0,0));await bot.waitForTicks(5);if(bot.blockAt(roof)?.name!=='crafting_table')throw Error('tablecap');await craftOne('stick');await craftOne('wooden_shovel',bot.blockAt(roof));const snow=bot.findBlocks({matching:b=>b.name==='snow',maxDistance:5,count:30});console.log('SNOW_CANDIDATES',JSON.stringify(snow));let harvested=null;for(const p of snow){let c;const actual=bot.blockAt(p),aim=p.offset(.5,.0625,.5),rs=[bot.entity.eyeHeight,1.8].map(h=>{const eye=bot.entity.position.offset(0,h,0),d=aim.minus(eye),hit=bot.world.raycast(eye,d.scaled(1/d.norm()),Math.max(.01,d.norm()-.02));return{h,dist:d.norm(),hit:hit?{p:hit.position,n:hit.name}:null}});console.log('SNOW_VIEW',JSON.stringify({p,n:actual?.name,props:actual?.getProperties(),rs}));if(rs.some(r=>r.dist>4.5||r.hit))continue;await bot.lookAt(aim,true);await bot.waitForTicks(2);c={face:1,intersect:aim};const pre=count('snowball');await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_shovel'),'hand');await bot.dig(bot.blockAt(p),'ignore',v(0,1,0));await bot.waitForTicks(15);console.log('SNOW_CUT_ACTUAL',JSON.stringify({p,pre,c:{face:c.face,hit:c.intersect},afterBlock:bot.blockAt(p)?.name,s:s()}));if(count('snowball')>pre){harvested=p;break}}if(!harvested)throw Error('no reachable snowball receipt');bot.clearControlStates();bot.pathfinder.setGoal(null);const target=home.offset(0,1,1);await face(target);await observeOneSnowball({aim:target.offset(.5,.5,.5),maxTicks:30});}
catch(e){console.log('SNOW_TRIAL_FAILURE',String(e),JSON.stringify(s()));}
finally{try{alive();if(changed){if(!bot.entity.position.floored().equals(home))await go(home);await put(door);await put(roof);}}catch(e){console.log('SNOW_ENDING_FAILURE',String(e),JSON.stringify(s()))}bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',died);for(let i=0;i<3;i++){console.log('ENDING',JSON.stringify({s:s(),faces:ofs.map(d=>{const p=bot.entity.position.floored().offset(...d);return{p,n:bot.blockAt(p)?.name,full:full(p)}})}));await bot.waitForTicks(5)}}

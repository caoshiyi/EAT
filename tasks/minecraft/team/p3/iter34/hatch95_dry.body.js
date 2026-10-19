global.p3Fire95=false;
// Read-only component. No item use/movement. Paste with observed current entity and launch.
// origin: actual projectile spawn (first native jump tick feet +1.52).
// velocity: observed spawned projectile velocity, or explicit nominal HYPOTHESIS.
// target: actual loaded end_crystal entity; test collision with its public width/height.
function inspectArc(origin, velocity, target, ticks=150) {
  let p=origin.clone(), vel=velocity.clone(), peak=p.y;
  const lo=target.position.offset(-target.width/2,0,-target.width/2);
  const hi=target.position.offset(target.width/2,target.height,target.width/2);
  function enterBox(a,b){
    let t0=0,t1=1;
    for(const k of ['x','y','z']){
      const d=b[k]-a[k];
      if(Math.abs(d)<1e-10){if(a[k]<lo[k]||a[k]>hi[k])return null;continue;}
      let u=(lo[k]-a[k])/d,w=(hi[k]-a[k])/d;if(u>w)[u,w]=[w,u];
      t0=Math.max(t0,u);t1=Math.min(t1,w);if(t0>t1)return null;
    }
    return t0;
  }
  for(let tick=0;tick<ticks;tick++){
    const next=p.plus(vel),delta=next.minus(p),length=delta.norm();
    if(!bot.blockAt(p)||!bot.blockAt(next))return {status:'unloaded',tick,p,next};
    const hit=length>1e-10?bot.world.raycast(p,delta.scaled(1/length),length):null;
    const entityT=enterBox(p,next);
    // raycast's intersect is the physical hit point, position is block coords.
    if(hit&&!hit.intersect)return {status:'ray_api_missing_intersect',tick,hit:hit.name};
    const blockT=hit?hit.intersect.distanceTo(p)/length:Infinity;
    if(entityT!==null&&entityT<blockT)return {status:'nominal_target_intersection',tick:tick+entityT,peak,p:p.plus(delta.scaled(entityT))};
    if(hit)return {status:'blocked',tick,peak,block:hit.name,at:hit.position,intersect:hit.intersect};
    p=next;peak=Math.max(peak,p.y);vel=vel.scaled(.99);vel.y-=.03;
  }
  return {status:'no_intersection',peak,terminal:p};
}

const REAL=global.p3Fire95===true,base=55,hatch=v(6,57,-26),hp0=bot.health;
const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(v(12.5,95,-39.5))<.1);
const ids=new Set(),flight=[],events=[],poses=[];let fired=false,accepted=false,tried=false,handler=null,reason='notstarted';
const spawn=e=>{if(e.name==='snowball'&&e.position.distanceTo(bot.entity.position)<4){ids.add(e.id);flight.push({event:'spawn',at:new Date().toISOString(),p:e.position.clone(),velocity:e.velocity?.clone()});}};
const moved=e=>{if(ids.has(e.id)&&flight.length<35)flight.push({event:'move',at:new Date().toISOString(),p:e.position.clone(),velocity:e.velocity?.clone()});};
const gone=e=>{if(ids.has(e.id)||e.id===target?.id)events.push({event:'gone',at:new Date().toISOString(),id:e.id,n:e.name,p:e.position.clone(),dim:bot.game.dimension,hp:bot.health});};
bot.on('entitySpawn',spawn);bot.on('entityMoved',moved);bot.on('entityGone',gone);
async function escape(){stop();if(bot.entity.position.floored().equals(v(6,55,-26))){await cut(v(6,54,-26));for(let k=0;k<25&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-53)>.03);k++)await wait(1);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-53)>.03)throw Error('escape landing');await place(v(6,55,-26),'end_stone');console.log('EMERGENCY_DROP',JSON.stringify(state()));}}
try{console.log('SHOT_SOURCE',JSON.stringify({real:REAL,state:state(),target:target?[target.id,target.position,target.width,target.height]:null}));if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(6,55,-26))||!bot.entity.onGround||!target||!full(hatch)||count('end_stone')<4||hp0<18||!boundary().every(b=>b.full)||(REAL&&!count('snowball')))throw Error('source');if(Object.values(bot.entities).some(e=>['area_effect_cloud','dragon_fireball'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<20))throw Error('hazard preflight');
const a=77.94*Math.PI/180,d=target.position.minus(bot.entity.position),R=Math.hypot(d.x,d.z),out=v(d.x/R*Math.cos(a),Math.sin(a),d.z/R*Math.cos(a));
await cut(hatch);const nominalVelocity=out.scaled(1.5);nominalVelocity.y+=.42;const predicted=inspectArc(v(bot.entity.position.x,base+1.94,bot.entity.position.z),nominalVelocity,target);console.log('ARC_CURRENT_SHAPES',JSON.stringify(predicted));if(predicted.status!=='nominal_target_intersection')throw Error('nominal arc blocked');
if(REAL)await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');await bot.lookAt(bot.entity.position.offset(0,bot.entity.eyeHeight,0).plus(out.scaled(20)),true);await wait(3);
handler=()=>{const p=bot.entity.position.clone();if(poses.length<30)poses.push({at:new Date().toISOString(),p,height:bot.entity.height,eye:bot.entity.eyeHeight,top:p.y+bot.entity.height,hp:bot.health});};
bot.on('physicsTick',handler);bot.setControlState('jump',true);for(let k=0;k<25;k++){await wait(1);const p=bot.entity.position.clone();if(!tried&&p.y>base+.1){tried=true;reason='phase skip';if(p.y>=base+.39&&p.y<=base+.46){const hit=bot.world.raycast(p.offset(0,bot.entity.eyeHeight,0),out,3);if(!hit){accepted=true;reason=REAL?'ordinaryuse':'dryqualified';console.log('FIRST_TICK_AFTER_POSITION',JSON.stringify({p,h:bot.entity.height,eye:bot.entity.eyeHeight,pitch:bot.entity.pitch,yaw:bot.entity.yaw,R,real:REAL}));if(REAL){bot.activateItem();fired=true;}}else reason='outgoingblocked '+hit.name;}bot.setControlState('jump',false);bot.setControlState('sneak',true);}if(tried&&bot.entity.onGround&&Math.abs(bot.entity.position.y-base)<.03&&k>3)break;}

}catch(e){reason=String(e);console.log('SHOT_ABORT',reason,JSON.stringify(state()));}
finally{if(handler)bot.removeListener('physicsTick',handler);stop();try{if(bot.entity.onGround&&bot.entity.position.floored().equals(v(6,55,-26)))await place(hatch,'end_stone');else throw Error('not original landing');}catch(e){console.log('REPAIR_FAIL',String(e));try{await escape();}catch(f){console.log('ESCAPE_FAIL',String(f));}}
if(REAL)for(let k=0;k<90;k++){await wait(1);if(bot.health<hp0&&bot.entity.position.y===55){try{await escape();}catch(e){console.log('HURT_ESCAPE_FAIL',String(e));}break;}}
console.log('SHOT_RESULT',JSON.stringify({real:REAL,reason,accepted,fired,poses,flight,events,targetPresent:target?!!bot.entities[target.id]:null,state:state(),boundary:boundary(),crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>[e.id,e.position])}));bot.removeListener('entitySpawn',spawn);bot.removeListener('entityMoved',moved);bot.removeListener('entityGone',gone);stop();}

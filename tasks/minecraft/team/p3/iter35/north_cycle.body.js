async function phase(test,action){bot.setControlState('jump',true);try{for(let k=0;k<15;k++){await wait(1);if(test()){await action();return;}}throw Error('jump phase');}finally{bot.setControlState('jump',false);}}
async function land(y){for(let k=0;k<25;k++){await wait(1);if(bot.entity.onGround&&Math.abs(bot.entity.position.y-y)<.04)return;}throw Error('landing '+y);}
async function closedUp(material='cobblestone'){const p=bot.entity.position.floored(),hp=bot.health,t=Date.now();if(!boundary().every(b=>b.full)||!bot.entity.onGround)throw Error('UP source');await cut(p.offset(0,2,0));await phase(()=>bot.entity.position.y>p.y+.5,()=>place(p,material));await land(p.y+1);for(const d of[[1,2,0],[-1,2,0],[0,2,1],[0,2,-1]])await place(p.offset(...d),'end_stone');if(!full(p.offset(0,3,0))){await phase(()=>bot.entity.position.y>p.y+1.4,()=>place(p.offset(1,3,0),'end_stone'));bot.setControlState('sneak',true);await land(p.y+1);stop();await place(p.offset(0,3,0),'end_stone');}console.log('ONE_UP',JSON.stringify({ms:Date.now()-t,state:state(),faces:boundary()}));if(bot.health<hp||!boundary().every(b=>b.full))throw Error('UP changed');}
async function northDown(){stop();let p=bot.entity.position.floored();if(p.x!==-9||p.z!==-26||p.y<55||p.y>63)throw Error('DOWN source');while(bot.entity.position.y>55.04){const q=bot.entity.position.floored();if(!full(q.offset(0,-2,0)))throw Error('DOWN nextfloor');await cut(q.offset(0,-1,0));await land(q.y-1);}await place(v(-9,57,-26),'end_stone');console.log('NORTH_DOWN',JSON.stringify({...state(),faces:boundary()}));}
console.log('SOURCE',JSON.stringify(state()));if(!bot.entity.position.floored().equals(v(-9,55,-26)))throw Error('source');let damage=[];const hurt=e=>{if(e.id===bot.entity.id)damage.push({at:new Date().toISOString(),hp:bot.health,p:bot.entity.position.clone(),dragon:Object.values(bot.entities).filter(x=>x.name==='ender_dragon').map(x=>({p:x.position,meta:x.metadata}))});};bot.on('entityHurt',hurt);try{await preciseCenter();let launchWindow=false;for(let k=0;k<600;k++){const dragon=Object.values(bot.entities).find(e=>e.name==='ender_dragon');if(dragon&&(Math.hypot(dragon.position.x+8.5,dragon.position.z+25.5)>45||dragon.position.y>85)){console.log('WINDOW',JSON.stringify({dragon:dragon.position,meta:dragon.metadata,state:state()}));launchWindow=true;break;}await wait(1);}if(!launchWindow)throw Error('no observed departure window');for(let i=0;i<7;i++){if(Object.values(bot.entities).some(e=>['area_effect_cloud','dragon_fireball'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<20))throw Error('UP current cloud');await closedUp(i<2?'cobblestone':'netherrack');}}catch(e){console.log('RAISE_FAIL',String(e),JSON.stringify({state:state(),damage}));try{await northDown();}catch(f){console.log('DOWN_FAIL',String(f));}bot.removeListener('entityHurt',hurt);throw e;}
global.fireNorth104=true;
// UNQUALIFIED at new fixture; default DRY. Compose with travel_core.js.
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

const REAL=global.fireNorth104===true,base=62,hatch=v(-9,64,-26),hp0=bot.health;
const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(v(-12.5,104,-39.5))<.1);
const ids=new Set(),flight=[],events=[],poses=[];let fired=false,accepted=false,tried=false,handler=null,reason='notstarted';
const spawn=e=>{if(e.name==='snowball'&&e.position.distanceTo(bot.entity.position)<4){ids.add(e.id);flight.push({event:'spawn',at:new Date().toISOString(),p:e.position.clone(),velocity:e.velocity?.clone()});}};
const moved=e=>{if(ids.has(e.id)&&flight.length<35)flight.push({event:'move',at:new Date().toISOString(),p:e.position.clone(),velocity:e.velocity?.clone()});};
const gone=e=>{if(ids.has(e.id)||e.id===target?.id)events.push({event:'gone',at:new Date().toISOString(),id:e.id,n:e.name,p:e.position.clone(),dim:bot.game.dimension,hp:bot.health});};
bot.on('entitySpawn',spawn);bot.on('entityMoved',moved);bot.on('entityGone',gone);
async function escape(){await northDown();}
try{console.log('SHOT_SOURCE',JSON.stringify({real:REAL,state:state(),target:target?[target.id,target.position,target.width,target.height]:null}));if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(-9,62,-26))||!bot.entity.onGround||!target||!full(hatch)||count('end_stone')<4||hp0<18||!boundary().every(b=>b.full)||(REAL&&!count('snowball')))throw Error('source');if(Object.values(bot.entities).some(e=>['area_effect_cloud','dragon_fireball'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<20))throw Error('hazard preflight');
const a=78.25*Math.PI/180,d=target.position.minus(bot.entity.position),R=Math.hypot(d.x,d.z),out=v(d.x/R*Math.cos(a),Math.sin(a),d.z/R*Math.cos(a));
await cut(hatch);const nominalVelocity=out.scaled(1.5);nominalVelocity.y+=.42;const predicted=inspectArc(v(bot.entity.position.x,base+1.94,bot.entity.position.z),nominalVelocity,target);console.log('ARC_CURRENT_SHAPES',JSON.stringify(predicted));if(predicted.status!=='nominal_target_intersection')throw Error('nominal arc blocked');
if(REAL)await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');await bot.lookAt(bot.entity.position.offset(0,bot.entity.eyeHeight,0).plus(out.scaled(20)),true);await wait(3);
handler=()=>{const p=bot.entity.position.clone();if(poses.length<30)poses.push({at:new Date().toISOString(),p,height:bot.entity.height,eye:bot.entity.eyeHeight,top:p.y+bot.entity.height,hp:bot.health});};
bot.on('physicsTick',handler);bot.setControlState('jump',true);for(let k=0;k<25;k++){await wait(1);const p=bot.entity.position.clone();if(!tried&&p.y>base+.1){tried=true;reason='phase skip';if(p.y>=base+.39&&p.y<=base+.46){const hit=bot.world.raycast(p.offset(0,bot.entity.eyeHeight,0),out,3);if(!hit){accepted=true;reason=REAL?'ordinaryuse':'dryqualified';console.log('FIRST_TICK_AFTER_POSITION',JSON.stringify({p,h:bot.entity.height,eye:bot.entity.eyeHeight,pitch:bot.entity.pitch,yaw:bot.entity.yaw,R,real:REAL}));if(REAL){bot.activateItem();fired=true;}}else reason='outgoingblocked '+hit.name;}bot.setControlState('jump',false);bot.setControlState('sneak',true);}if(tried&&bot.entity.onGround&&Math.abs(bot.entity.position.y-base)<.03&&k>3)break;}

}catch(e){reason=String(e);console.log('SHOT_ABORT',reason,JSON.stringify(state()));}
finally{if(handler)bot.removeListener('physicsTick',handler);stop();try{if(bot.entity.onGround&&bot.entity.position.floored().equals(v(-9,62,-26)))await place(hatch,'end_stone');else throw Error('not original landing');}catch(e){console.log('REPAIR_FAIL',String(e));try{await escape();}catch(f){console.log('ESCAPE_FAIL',String(f));}}
try{await northDown();}catch(e){console.log('POSTSHOT_DOWN_FAIL',String(e));}
if(REAL)for(let k=0;k<90;k++){await wait(1);if(bot.health<hp0&&bot.entity.position.y>55){try{await escape();}catch(e){console.log('HURT_ESCAPE_FAIL',String(e));}break;}}
console.log('SHOT_RESULT',JSON.stringify({real:REAL,reason,accepted,fired,poses,flight,events,targetPresent:target?!!bot.entities[target.id]:null,state:state(),boundary:boundary(),crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>[e.id,e.position])}));bot.removeListener('entitySpawn',spawn);bot.removeListener('entityMoved',moved);bot.removeListener('entityGone',gone);stop();}

console.log('DAMAGE_TRACE',JSON.stringify(damage));bot.removeListener('entityHurt',hurt);

async function phase(test,action){bot.setControlState('jump',true);try{for(let k=0;k<15;k++){await wait(1);if(test()){await action();return;}}throw Error('jump phase');}finally{bot.setControlState('jump',false);}}
async function land(y){for(let k=0;k<25;k++){await wait(1);if(bot.entity.onGround&&Math.abs(bot.entity.position.y-y)<.04)return;}throw Error('landing '+y);}
async function closedUp(){const p=bot.entity.position.floored(),hp=bot.health,t=Date.now();if(!boundary().every(b=>b.full)||!bot.entity.onGround)throw Error('UP source');await cut(p.offset(0,2,0));await phase(()=>bot.entity.position.y>p.y+.5,()=>place(p,'cobblestone'));await land(p.y+1);for(const d of[[1,2,0],[-1,2,0],[0,2,1],[0,2,-1]])await place(p.offset(...d),'end_stone');if(!full(p.offset(0,3,0))){await phase(()=>bot.entity.position.y>p.y+1.4,()=>place(p.offset(1,3,0),'end_stone'));bot.setControlState('sneak',true);await land(p.y+1);stop();await place(p.offset(0,3,0),'end_stone');}console.log('ONE_UP',JSON.stringify({ms:Date.now()-t,state:state(),faces:boundary()}));if(bot.health<hp||!boundary().every(b=>b.full))throw Error('UP changed');}
async function southDown(){stop();const p=bot.entity.position.floored();if(p.x!==12||p.z!==25||p.y<55||p.y>58)throw Error('DOWN source');while(bot.entity.position.y>55.04){let q=bot.entity.position.floored();if(!full(q.offset(0,-2,0)))throw Error('DOWN nextfloor');await cut(q.offset(0,-1,0));await land(q.y-1);}await place(v(12,57,25),'end_stone');console.log('SOUTH_DOWN',JSON.stringify({...state(),faces:boundary()}));}

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


console.log('SOURCE',JSON.stringify(state()));try{await closedUp();await closedUp();await cut(v(12,59,25));const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(v(12.5,101,39.5))<.1),p=bot.entity.position,R=target.position.minus(p);let rows=[];for(let deg=77;deg<=80.5;deg+=.1){let a=deg*Math.PI/180,d=R.clone();d.y=0;d=d.scaled(1/d.norm());let vel=v(d.x*1.5*Math.cos(a),1.5*Math.sin(a)+.42,d.z*1.5*Math.cos(a)),r=inspectArc(p.offset(0,1.94,0),vel,target);rows.push({deg:Math.round(deg*10)/10,r});}console.log('SCAN',JSON.stringify(rows));}catch(e){console.log('FAIL',String(e));}finally{await place(v(12,59,25),'end_stone');await southDown();stop();}

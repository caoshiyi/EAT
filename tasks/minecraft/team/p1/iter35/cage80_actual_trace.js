const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z);let removed=new Set();
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
    let hit=null;for(let sub=0;sub<Math.ceil(length/.08);sub++){const a=p.plus(delta.scaled(sub/Math.ceil(length/.08))),len=length/Math.ceil(length/.08);const h=bot.world.raycast(a,delta.scaled(1/length),len);if(h&&!removed.has([h.position.x,h.position.y,h.position.z].join(','))){hit=h;break;}}
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

removed=new Set(['6,57,-26']);const t=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&Math.abs(e.position.y-80)<.01);if(!t)throw Error('targetabsent');console.log('ACTUAL_REPLAY',JSON.stringify({packet:inspectArc(v(6.5,56.939999990165234,-25.514948623668474),v(0.497125,1.83575,0.009875),t),fit:inspectArc(v(6.5,56.939999990165234,-25.514948623668474),v(0.497230942390196,1.835824027873684,0.009921260668390464),t),hatchIgnored:[...removed],p:bot.entity.position,hp:bot.health}));
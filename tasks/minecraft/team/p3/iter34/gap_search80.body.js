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

stop();const e=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(v(33.5,80,-24.5))<.1);if(!e)throw Error('target absent');const source=v(6.5,56.94,-25.5),t=Date.now(),hits=[];let tries=0;
function after3(vel){let p=source.clone();for(let n=0;n<3;n++){p=p.plus(vel);vel=vel.scaled(.99);vel.y-=.03;}return[p,vel];}
outer:for(const angle of[71.63,71.53,71.73,71.43,71.83,71.33,71.93])for(const ox of[-.8,-.4,0,.4,.8])for(const oz of[-.8,-.4,0,.4,.8]){if(Date.now()-t>2800)break outer;const dx=e.position.x+ox-source.x,dz=e.position.z+oz-source.z,R=Math.hypot(dx,dz),a=angle*Math.PI/180,out=v(dx/R*Math.cos(a),Math.sin(a),dz/R*Math.cos(a)),vel=out.scaled(1.5);vel.y+=.42;const[p,u]=after3(vel.clone()),r=inspectArc(p,u,e,140);tries++;if(r.status==='nominal_target_intersection'){let score=0,tests=0;for(const [x,y,z] of [[0,0,0],[.01,0,0],[-.01,0,0],[0,.01,0],[0,-.01,0],[0,0,.01],[0,0,-.01]]){const[q,w]=after3(vel.offset(x,y,z));if(inspectArc(q,w,e,140).status==='nominal_target_intersection')score++;tests++;}hits.push({angle,ox,oz,score,tests,r});if(hits.length>=12)break outer;}}
hits.sort((a,b)=>b.score-a.score);console.log('GAP_SEARCH',JSON.stringify({scope:'read-only nominal after3ticks; own closed hatch ignored in prefix, full real trace required before launch',tries,ms:Date.now()-t,hits}));console.log('SOURCE',JSON.stringify(state()));

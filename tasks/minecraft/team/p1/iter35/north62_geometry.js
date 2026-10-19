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

const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&Math.abs(e.position.y-104)<.01);if(!target)throw Error('target absent');const rows=[];
for(const src of[v(-8.5,62,-25.5),v(-12.5,62,-53.5),v(-12.5,62,-52.5),v(-12.5,62,-50.5),v(-25.5,62,-39.5)]){for(let degree=76;degree<=82;degree+=.25){const d=target.position.minus(src),R=Math.hypot(d.x,d.z),a=degree*Math.PI/180,nom=v(d.x/R*Math.cos(a)*1.5,Math.sin(a)*1.5+.42,d.z/R*Math.cos(a)*1.5);removed=new Set([src.floored().offset(0,2,0).toArray?.().join(',')||[Math.floor(src.x),64,Math.floor(src.z)].join(',')]);let counts={},worst=[];for(const x of[-.011,0,.011])for(const y of[-.011,0,.011])for(const z of[-.011,0,.011]){const q=inspectArc(src.offset(0,1.94,0),nom.plus(v(x,y,z)),target);counts[q.status]=(counts[q.status]||0)+1;if(q.status!=='nominal_target_intersection'&&worst.length<2)worst.push(q);}if(counts.nominal_target_intersection)rows.push({src,degree,counts,worst});}}
console.log('NORTH62_CANDIDATES',JSON.stringify({p:bot.entity.position,hp:bot.health,rows:rows.sort((a,b)=>(b.counts.nominal_target_intersection||0)-(a.counts.nominal_target_intersection||0)),columns:[[-9,-26],[-13,-54],[-13,-53],[-13,-51],[-26,-40]].map(([x,z])=>({x,z,blocks:Array.from({length:15},(_,i)=>({y:54+i,n:bot.blockAt(v(x,54+i,z))?.name}))}))}));

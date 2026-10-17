// Closest AABB point may be roof-occluded even when a deeper point on the same Blaze is visible.
function candidate(){const eye=self.position.offset(0,1.62,0),clamp=(v,l,h)=>Math.max(l,Math.min(h,v)),options=[];
 for(const e of Object.values(bot.entities)){if(e.name!=='blaze'||(e.metadata?.[9]??20)<=0)continue;const w=(e.width||.6)/2,h=e.height||1.8;
  const xs=[clamp(eye.x,e.position.x-w+.02,e.position.x+w-.02),e.position.x,e.position.x+w-.02,e.position.x-w+.02],zs=[clamp(eye.z,e.position.z-w+.02,e.position.z+w-.02),e.position.z,e.position.z+w-.02,e.position.z-w+.02],ys=[clamp(eye.y,e.position.y+.01,e.position.y+h-.01),e.position.y+.02];
  let best=null;for(const x of xs)for(const z of zs)for(const y of ys){const a=new Vec3(x,y,z),dv=a.minus(eye),n=dv.norm();if(n<.01||n>=2.90||best&&n>=best.n)continue;const obstruction=bot.world.raycast(eye,dv.scaled(1/n),n,(bl,it)=>bl.position.equals(G)?null:it.intersect(bl.shapes,bl.position));if(!obstruction)best={e,a,n};}if(best)options.push(best);
 }return options.sort((a,b)=>(a.e.metadata?.[9]??20)-(b.e.metadata?.[9]??20)||a.n-b.n)[0];}

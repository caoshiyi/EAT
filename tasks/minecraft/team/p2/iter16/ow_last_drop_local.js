function p2LandingThreats(bot,foot,removed=[]){
 const key=q=>q.toArray().join(','),virtual=new Set(removed.map(key)),foes=new Set(['skeleton','stray','zombie','creeper','spider','cave_spider','witch','pillager','vindicator','silverfish','enderman','zombie_villager']);
 const rays=[];for(const e of Object.values(bot.entities)){if(!foes.has(e.name)||(e.metadata?.[9]??1)<=0||e.position.distanceTo(foot)>24)continue;for(const y of[.2,.9,1.5])for(const[x,z]of[[0,0],[.25,.25],[-.25,-.25],[.25,-.25],[-.25,.25]]){
  const a=e.position.offset(0,(e.height||1.8)*.85,0),b=foot.offset(x,y,z),d=b.minus(a),n=Math.ceil(d.norm()/.1);let wall=null,unknown=null;
  for(let k=1;k<n;k++){const p=a.plus(d.scaled(k/n)).floored();if(virtual.has(key(p)))continue;const block=bot.blockAt(p);if(!block){unknown=p.toArray();break;}if(block.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')){wall=p.toArray();break;}}
  if(!wall)rays.push({foe:e.id,name:e.name,p:e.position.toArray(),target:b.toArray(),unknown});
 }}return rays;
}

// Strict connected air-volume boundary check; read-only, optional virtual native cuts.
function p2EnclosedVolume(bot,origin,removed=[],limit=1024){
 const key=q=>q.toArray().join(','),virtual=new Set(removed.map(key)),pass=new Set(['air','cave_air','void_air','nether_portal','torch','wall_torch']),dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],queue=[origin.clone()],seen=new Set([key(origin)]);let walls=0;
 const full=b=>b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')&&!['magma_block','sand','gravel','suspicious_sand','suspicious_gravel'].includes(b.name);
 for(let i=0;i<queue.length;i++)for(const d of dirs){const q=queue[i].offset(...d),k=key(q);if(seen.has(k))continue;const b=bot.blockAt(q);if(!b)return{ok:false,issue:'UNLOADED_BOUNDARY',at:q.toArray(),cells:queue,walls};if(!virtual.has(k)&&full(b)){walls++;continue;}if(!virtual.has(k)&&!pass.has(b.name))return{ok:false,issue:'UNSAFE_PARTIAL_'+b.name,at:q.toArray(),cells:queue,walls};if(queue.length>=limit)return{ok:false,issue:'VOLUME_LIMIT',at:q.toArray(),cells:queue,walls};seen.add(k);queue.push(q);}
 const hostile=new Set(['blaze','ghast','skeleton','wither_skeleton','piglin','hoglin','zoglin','magma_cube','zombie','creeper','spider','enderman','silverfish','cave_spider','stray','drowned','witch']);
 for(const e of Object.values(bot.entities))if(hostile.has(e.name)&&(e.metadata?.[9]??1)>0&&queue.some(q=>e.position.x+.3>q.x&&e.position.x-.3<q.x+1&&e.position.z+.3>q.z&&e.position.z-.3<q.z+1&&e.position.y+(e.height||1.8)>q.y&&e.position.y<q.y+1))return{ok:false,issue:'HOSTILE_INSIDE_'+e.name,at:e.position.toArray(),cells:queue,walls};
 return{ok:true,issue:null,cells:queue,walls};
}

const{Vec3}=require('vec3'),p=new Vec3(144,-33,2241),q=p.offset(0,-1,0),landing=p.offset(0,-3,0),hp=bot.health,self=bot.entity,start=Date.now();let issue=null,cut=false;
bot.clearControlStates();bot.pathfinder.setGoal(null);const full=v=>bot.blockAt(v)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
try{
 if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(p.offset(.5,0,.5))>.2||!bot.entity.onGround||bot.blockAt(q)?.name!=='cobbled_deepslate'||![-2,-3].every(y=>['air','cave_air'].includes(bot.blockAt(p.offset(0,y,0))?.name))||!full(p.offset(0,-4,0)))throw Error('ACTUAL_THREE_DROP_GEOMETRY');
 const rays=p2LandingThreats(bot,landing.offset(.5,0,.5),[q]);if(rays.length)throw Error('LANDING_HOSTILE_OR_UNKNOWN_RAY_'+JSON.stringify(rays[0]));
 await bot.unequip('hand');await bot.waitForTicks(4);const price=bot.digTime(bot.blockAt(q));if(bot.heldItem||Date.now()+price+6000>start+30000)throw Error('WHOLE_PRICE');
 await bot.dig(bot.blockAt(q),true);cut=true;for(let n=0;n<50&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-landing.y)>.1);n++){if(bot.entity!==self||bot.game.dimension!=='overworld'||bot.health<hp||Date.now()-start>35000)throw Error('BODY_TIME');await bot.waitForTicks(1);}
 if(!bot.entity.onGround||bot.entity.position.distanceTo(landing.offset(.5,0,.5))>.2)throw Error('ACTUAL_LANDING');
}catch(e){issue=e.message}finally{bot.clearControlStates();bot.pathfinder.setGoal(null)}const r=p2EnclosedVolume(bot,bot.entity.position.floored());return{visibleRaysAfter:p2LandingThreats(bot,bot.entity.position),issue,cut,p:bot.entity.position,hp:bot.health,food:bot.food,closed:r.ok,volumeCells:r.cells.length,volumeIssue:r.issue,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState};

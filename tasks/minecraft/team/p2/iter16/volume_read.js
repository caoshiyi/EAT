// Strict connected air-volume boundary check; read-only, optional virtual native cuts.
function p2EnclosedVolume(bot,origin,removed=[],limit=1024){
 const key=q=>q.toArray().join(','),virtual=new Set(removed.map(key)),pass=new Set(['air','cave_air','void_air','nether_portal','torch','wall_torch']),dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],queue=[origin.clone()],seen=new Set([key(origin)]);let walls=0;
 const full=b=>b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')&&!['magma_block','sand','gravel','suspicious_sand','suspicious_gravel'].includes(b.name);
 for(let i=0;i<queue.length;i++)for(const d of dirs){const q=queue[i].offset(...d),k=key(q);if(seen.has(k))continue;const b=bot.blockAt(q);if(!b)return{ok:false,issue:'UNLOADED_BOUNDARY',at:q.toArray(),cells:queue,walls};if(!virtual.has(k)&&full(b)){walls++;continue;}if(!virtual.has(k)&&!pass.has(b.name))return{ok:false,issue:'UNSAFE_PARTIAL_'+b.name,at:q.toArray(),cells:queue,walls};if(queue.length>=limit)return{ok:false,issue:'VOLUME_LIMIT',at:q.toArray(),cells:queue,walls};seen.add(k);queue.push(q);}
 const hostile=new Set(['blaze','ghast','skeleton','wither_skeleton','piglin','hoglin','zoglin','magma_cube','zombie','creeper','spider','enderman','silverfish','cave_spider','stray','drowned','witch']);
 for(const e of Object.values(bot.entities))if(hostile.has(e.name)&&(e.metadata?.[9]??1)>0&&queue.some(q=>e.position.x+.3>q.x&&e.position.x-.3<q.x+1&&e.position.z+.3>q.z&&e.position.z-.3<q.z+1&&e.position.y+(e.height||1.8)>q.y&&e.position.y<q.y+1))return{ok:false,issue:'HOSTILE_INSIDE_'+e.name,at:e.position.toArray(),cells:queue,walls};
 return{ok:true,issue:null,cells:queue,walls};
}

bot.clearControlStates();bot.pathfinder.setGoal(null);const r=p2EnclosedVolume(bot,bot.entity.position.floored());return{p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,volume:{ok:r.ok,issue:r.issue,at:r.at,cells:r.cells.length,walls:r.walls},inv:bot.inventory.items().map(i=>[i.name,i.count])};

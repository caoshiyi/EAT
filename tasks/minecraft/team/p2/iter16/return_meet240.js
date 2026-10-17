// Pure world read: bounded two-high horizontal AIR tube with prospective next cut.
// Inline into owner caller. Does not mine, place, move, equip, or control a player.
function p3ClosedTube(bot,here,next,maxCells=12,native=null){
 const key=q=>[q.x,q.y,q.z].join(','),air=q=>['air','cave_air','void_air','torch','wall_torch'].includes(bot.blockAt(q)?.name);
 const full=native||(q=>{const b=bot.blockAt(q);return b&&!/lava|water|fire|magma|gravel|^sand$/.test(b.name)&&b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')});
 if(next.y!==here.y)return{ok:false,issue:'VERTICAL_KEEP_ORIGINAL_GUARD',cells:[]};
 if(Math.abs(next.x-here.x)+Math.abs(next.z-here.z)>1)return{ok:false,issue:'NEXT_NOT_ADJACENT',cells:[]};
 const virtual=new Set([key(next),key(next.offset(0,1,0))]);
 for(const q of[here,here.offset(0,1,0)])if(!air(q))return{ok:false,issue:'BODY_NOT_AIR',cells:[]};
 for(const q of[next,next.offset(0,1,0)])if(!air(q)&&!full(q))return{ok:false,issue:'NEXT_UNSAFE_KIND',cells:[]};
 const clear=q=>virtual.has(key(q))||air(q),queue=[here],seen=new Set([key(here)]),fail=issue=>({ok:false,issue,cells:queue});
 for(let i=0;i<queue.length;i++){
  const q=queue[i];if(!full(q.offset(0,-1,0))||!full(q.offset(0,2,0)))return fail('FLOOR_ROOF_OPEN_'+q.toArray().join(',')+'_below_'+bot.blockAt(q.offset(0,-1,0))?.name+'_above_'+bot.blockAt(q.offset(0,2,0))?.name);
  for(const[x,z]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const n=q.offset(x,0,z);if(seen.has(key(n)))continue;
   const a=n,b=n.offset(0,1,0);
   if(full(a)&&full(b)&&!virtual.has(key(a)))continue;
   if(!clear(a)||!clear(b))return fail('PARTIAL_OR_UNSAFE_SIDE_'+n.toArray().join(','));
   if(queue.length>=maxCells)return fail('TUBE_LIMIT');
   seen.add(key(n));queue.push(n);
  }
 }
 const hostile=new Set(['blaze','ghast','skeleton','wither_skeleton','piglin','hoglin','zoglin','magma_cube','zombie','creeper','spider','enderman','silverfish','cave_spider','stray','drowned','witch']);
 for(const e of Object.values(bot.entities||{}))if(hostile.has(e.name)&&(e.metadata?.[9]??1)>0&&queue.some(q=>e.position.x>=q.x-.3&&e.position.x<=q.x+1.3&&e.position.z>=q.z-.3&&e.position.z<=q.z+1.3&&e.position.y<q.y+2&&e.position.y+(e.height||1.8)>q.y))return fail('HOSTILE_INSIDE');
 return{ok:true,issue:null,cells:queue};
}



const origin=bot.entity.position.clone(),body=bot.entity,hp=bot.health,start=Date.now();let issue=null;
bot.clearControlStates();bot.pathfinder.setGoal(null);
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=q=>['air','cave_air'].includes(bot.blockAt(q)?.name);
try{
 if(bot.game.dimension!=='the_nether'||Math.abs(origin.x-25.5)>.2||origin.y!==8||origin.z<222||origin.z>225)throw Error('ACTUAL_START');
 while(bot.entity.position.z<240.4){
  if(bot.entity!==body||bot.health<hp||bot.game.dimension!=='the_nether'||Date.now()-start>12000)throw Error('BODY_TIME');
  const p=bot.entity.position.floored();for(let n=0;n<3;n++){const q=p.offset(0,0,n);if(q.z>240)continue;if(!air(q)||!air(q.offset(0,1,0))||!full(q.offset(0,-1,0))||!full(q.offset(0,2,0)))throw Error('KNOWN_BACK_TUBE_'+q);}
  if(Object.values(bot.entities).some(e=>e.name&&['blaze','piglin','hoglin','magma_cube','wither_skeleton','skeleton','ghast'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<12))throw Error('LOCAL_HOSTILE');
  await bot.lookAt(bot.entity.position.offset(0,1.4,3),true);bot.setControlState('forward',true);bot.setControlState('sneak',bot.entity.position.z>240);await bot.waitForTicks(1);
 }
}catch(e){issue=e.message}finally{bot.clearControlStates();bot.pathfinder.setGoal(null);}
await bot.waitForTicks(2);const p=bot.entity.position.floored(),r=p3ClosedTube(bot,p,p,512);return{issue,p:bot.entity.position,hp:bot.health,food:bot.food,closed:r.ok,compoundCells:r.cells.length,compoundIssue:r.issue,origin,controls:bot.controlState,inv:bot.inventory.items().map(i=>[i.name,i.count])};

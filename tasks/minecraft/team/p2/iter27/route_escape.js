// Ordinary walking only: reconcile actual landed ledge before indexing prepared steps.
async function escapePreparedRoute(route,guard){
 guard.beginEscape('preparedactualwalk');bot.pathfinder.setGoal(null);bot.clearControlStates();
 for(let k=0;k<30&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-Math.round(bot.entity.position.y))>.03);k++){guard.escape('actualledgefall');await sleep(1);}
 if(!bot.entity.onGround)throw Error('actualledgefailedtoland');let q=bot.entity.position.floored(),idx=route.findIndex(r=>r.equals(q));
 if(idx<0){const candidates=route.map((r,i)=>({r,i,dist:r.offset(.5,0,.5).distanceTo(bot.entity.position)})).filter(o=>Math.abs(o.r.y-bot.entity.position.y)<.03&&o.dist<=1.25&&full(o.r.offset(0,-1,0))&&[o.r,o.r.offset(0,1,0)].every(c=>['air','cave_air'].includes(bot.blockAt(c)?.name))).sort((a,b)=>a.dist-b.dist);if(!candidates.length)throw Error('actualledgeoffpreparedroute');console.log('ACTUAL_LEDGE_RECENTER',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,target:candidates[0].r}));await flat(candidates[0].r.offset(.5,0,.5));guard.escape('afterphysicalrecenter');idx=candidates[0].i;}
 console.log('ACTUAL_PREPARED_ESCAPE_START',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,idx}));
 for(let k=idx-1;k>=0;k--){guard.escape('nextpreparedstep');const target=route[k],a=bot.entity.position.floored();for(const c of[target.offset(0,1,0),target,...(target.y<a.y?[target.offset(0,2,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(c)?.name))await cut(c,['end_stone','basalt']);await fastWalkStep(target);}
 await seal(true);
}

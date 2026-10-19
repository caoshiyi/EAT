async function fastWalkStep(q){
 walkCheck('fastwalkstart');const a=bot.entity.position.floored(),center=q.offset(.5,0,.5);
 if(!bot.entity.onGround||Math.abs(q.x-a.x)+Math.abs(q.z-a.z)!==1||q.y>a.y||a.y-q.y>1||!full(q.offset(0,-1,0)))throw Error('fastwalk actualgeometry');
 for(const b of[q,q.offset(0,1,0),...(q.y<a.y?[q.offset(0,2,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(b)?.name))throw Error('fastwalk unclearedcell '+b+' '+bot.blockAt(b)?.name);
 await bot.lookAt(v(center.x,bot.entity.position.y+bot.entity.eyeHeight,center.z),true);walkCheck('fastwalklook');const began=Date.now();
 bot.setControlState('forward',true);try{while(Math.hypot(bot.entity.position.x-center.x,bot.entity.position.z-center.z)>.14&&Date.now()-began<1800){await sleep(1);walkCheck('fastwalktick');}}finally{bot.clearControlStates();}
 for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03);k++){await sleep(1);walkCheck('fastwalkfall');}await sleep(2);walkCheck('fastwalklanded');if(bot.entity.onGround&&Math.abs(bot.entity.position.y-q.y)<.03&&bot.entity.position.distanceTo(center)>.12){console.log('ACTUAL_STEP_RECENTER',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,target:q}));await flat(center);walkCheck('aftersteprecenter');}walkCheck('fastwalkpost');
 console.log('ACTUAL_WALK_STEP',JSON.stringify({at:new Date().toISOString(),target:q,p:bot.entity.position,hp:bot.health,elapsedMs:Date.now()-began}));
 if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03||bot.entity.position.distanceTo(center)>.32)throw Error('fastwalkpost');
}

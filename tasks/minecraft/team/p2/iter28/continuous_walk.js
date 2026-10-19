// Ordinary continuous walking down a prepared, straight supported segment.
// No per-cell centering pause; retain final actual ground/Y/position checks.
async function continuousWalkSegment(points,guard){
 guard.escape('continuous segment start');const start=points[0],end=points.at(-1),a=bot.entity.position.floored();
 if(!a.equals(start)||!bot.entity.onGround||points.length<2)throw Error('continuous actual source');
 const dx=Math.sign(end.x-start.x),dz=Math.sign(end.z-start.z);if(Math.abs(dx)+Math.abs(dz)!==1)throw Error('continuous straight axis');
 for(let i=1;i<points.length;i++){const q=points[i],prev=points[i-1];if(q.x-prev.x!==dx||q.z-prev.z!==dz||q.y>prev.y||prev.y-q.y>1||!full(q.offset(0,-1,0)))throw Error('continuous actual geometry '+q);for(const c of[q,q.offset(0,1,0),...(q.y<prev.y?[q.offset(0,2,0)]:[])])if(!['air','cave_air'].includes(bot.blockAt(c)?.name))throw Error('continuous uncleared '+c);}
 const center=end.offset(.5,0,.5),began=Date.now(),samples=[];let lastProgress=Date.now(),last=bot.entity.position.clone();
 await bot.lookAt(v(center.x,bot.entity.position.y+bot.entity.eyeHeight,center.z),true);guard.escape('continuous looked');
 const remaining=()=>dx*(center.x-bot.entity.position.x)+dz*(center.z-bot.entity.position.z);
 bot.setControlState('forward',true);try{while(remaining()>.20&&Date.now()-began<5000){await sleep(1);guard.escape('continuous walking');if(samples.length<16)samples.push({at:new Date().toISOString(),p:bot.entity.position.clone(),ground:bot.entity.onGround,hp:bot.health});if(bot.entity.position.distanceTo(last)>.08){last=bot.entity.position.clone();lastProgress=Date.now();}if(Date.now()-lastProgress>600)throw Error('continuous stalled');if(bot.entity.position.y<end.y-.1)throw Error('continuous fell below destination');}}finally{bot.clearControlStates();}
 for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-end.y)>.03);k++){await sleep(1);guard.escape('continuous final land');}await sleep(2);guard.escape('continuous final settled');
 console.log('CONTINUOUS_ACTUAL_LANDING',JSON.stringify({at:new Date().toISOString(),start,end,p:bot.entity.position,hp:bot.health,elapsedMs:Date.now()-began,samples}));
 if(!bot.entity.onGround||Math.abs(bot.entity.position.y-end.y)>.03||!bot.entity.position.floored().equals(end))throw Error('continuous final actual cell');
 if(bot.entity.position.distanceTo(center)>.22){await flat(center);guard.escape('continuous final recenter');}
 if(!bot.entity.onGround||bot.entity.position.distanceTo(center)>.25)throw Error('continuous final postcondition');
}

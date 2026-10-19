// Native forward+jump on a fully prepared straight rising segment; no state writes.
async function continuousPreparedClimb(points,check){
 const first=points[0],last=points.at(-1),dx=Math.sign(last.x-first.x),dz=Math.sign(last.z-first.z),center=last.offset(.5,0,.5),began=Date.now(),samples=[];
 if(!bot.entity.onGround||!bot.entity.position.floored().equals(first)||Math.abs(dx)+Math.abs(dz)!==1)throw Error('actualclimb source');
 for(let i=1;i<points.length;i++){const q=points[i],p=points[i-1];if(q.x-p.x!==dx||q.z-p.z!==dz||q.y-p.y!==1||!full(q.offset(0,-1,0))||![q,q.offset(0,1,0),q.offset(0,2,0),q.offset(0,3,0)].every(a=>['air','cave_air'].includes(bot.blockAt(a)?.name)))throw Error('actualclimb prepared geometry '+q);}
 await bot.lookAt(v(center.x,bot.entity.position.y+bot.entity.eyeHeight,center.z),true);check('climblook');
 bot.setControlState('forward',true);bot.setControlState('jump',true);try{while(Math.hypot(bot.entity.position.x-center.x,bot.entity.position.z-center.z)>.16&&Date.now()-began<2400){await sleep(1);bot.setControlState('jump',bot.entity.position.y<last.y-.03);check('actualnativeclimb');if(samples.length<16)samples.push({at:new Date().toISOString(),p:bot.entity.position.clone(),ground:bot.entity.onGround});if(bot.entity.position.y<first.y-.1)throw Error('actualclimbfell');}}finally{bot.clearControlStates();}
 let stable=0;for(let k=0;k<24;k++){check('climblanding');if(bot.entity.onGround&&Math.abs(bot.entity.position.y-last.y)<.03&&Math.hypot(bot.entity.velocity.x,bot.entity.velocity.z)<.012)stable++;else stable=0;if(stable>=1)break;await sleep(1);}
 if(stable<1||!bot.entity.position.floored().equals(last)||Math.abs(bot.entity.position.y-last.y)>.03)throw Error('actualclimblanding');if(bot.entity.position.distanceTo(center)>.25){await flat(center);check('climbfinalrecenter');}
 console.log('ACTUAL_CONTINUOUS_CLIMB',JSON.stringify({at:new Date().toISOString(),first,last,state:state(),elapsedMs:Date.now()-began,samples}));
 if(!bot.entity.onGround||bot.entity.position.distanceTo(center)>.25)throw Error('actualclimbfinalposition');
}

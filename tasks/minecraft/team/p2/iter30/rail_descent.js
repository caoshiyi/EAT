// Ordinary placement and native walking. rails MUST avoid the solid ascent column.
// Requires wall at x31 beside each rail. No actions beyond current visible client reach.
async function railDrop(q){
 live();const start=bot.entity.position.clone(),a=start.floored();
 if(!bot.entity.onGround||Math.abs(q.x-a.x)+Math.abs(q.z-a.z)!==1||(a.y-q.y<1||a.y-q.y>2))throw Error('rail source geometry');
 for(const c of[q,q.offset(0,1,0),q.offset(0,2,0)])if(!air(c))throw Error('rail blocked body '+c);
 // Revisit lane: old landing above our head physically blocks departing support.
 const oldFloor=v(q.x,a.y+1,q.z);if(full(oldFloor)){if(bot.blockAt(oldFloor)?.name!=='end_stone')throw Error('unknown overhead material');console.log('REMOVE_OLD_RAIL_FLOOR',oldFloor);await cut(oldFloor);}
 // Lean toward destination while retaining original support; current ray decides placement.
 const dx=q.x-a.x,dz=q.z-a.z;
 bot.setControlState('sneak',true);
 try{await center(a.x+.5+dx*.18,a.z+.5+dz*.18);await place(q.offset(0,-1,0));}
 finally{bot.setControlState('sneak',false);}
 const target=q.offset(.5,0,.5),t=Date.now();
 const remaining=()=>dx*(target.x-bot.entity.position.x)+dz*(target.z-bot.entity.position.z);
 try{await bot.lookAt(v(target.x,bot.entity.position.y-2,target.z),true);bot.setControlState('forward',true);while(remaining()>.14&&Date.now()-t<1600){live();await sleep(1);}}
 finally{bot.clearControlStates();}
 for(let k=0;k<25&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03);k++)await sleep(1);
 live();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03||Math.hypot(bot.entity.position.x-target.x,bot.entity.position.z-target.z)>.95)throw Error('rail landing cell');await sleep(5);if(Math.hypot(bot.entity.position.x-target.x,bot.entity.position.z-target.z)>.15){console.log('RAIL_RECENTER',JSON.stringify({p:bot.entity.position,target}));await center(target.x,target.z);}if(Math.hypot(bot.entity.position.x-target.x,bot.entity.position.z-target.z)>.22)throw Error('rail recenter');
 console.log('RAIL_DROP',JSON.stringify({at:new Date().toISOString(),start,target,state:{at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,hazards:snap().hazards}}));
}

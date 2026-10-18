// One visible head-cap test; no movement. Ordinary documented API and events only.
const V=bot.entity.position.constructor,target=new V(0,68,57),events=[],began=Date.now();let lost=false;
const full=p=>bot.blockAt(p)?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');
const inv=()=>bot.inventory.items().map(i=>({name:i.name,count:i.count,durabilityUsed:i.durabilityUsed}));
const sample=label=>{const b=bot.blockAt(target);console.log('HEAD_RECEIPT',JSON.stringify({label,ms:Date.now()-began,p:bot.entity.position.clone(),velocity:bot.entity.velocity.clone(),hp:bot.health,food:bot.food,eye:bot.entity.eyeHeight,ground:bot.entity.onGround,target:{p:target,n:b?.name,full:full(target)},inventory:inv(),drops:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<4).map(e=>({id:e.id,p:e.position.clone(),item:e.getDroppedItem?.()}))}));};
const handlers={forcedMove:()=>{events.push({event:'forcedMove',ms:Date.now()-began,p:bot.entity.position.clone()});sample('forcedMove');},diggingCompleted:b=>events.push({event:'diggingCompleted',ms:Date.now()-began,p:b?.position?.clone()}),diggingAborted:b=>events.push({event:'diggingAborted',ms:Date.now()-began,p:b?.position?.clone()}),blockUpdate:(a,b)=>{if(b?.position.equals(target))events.push({event:'blockUpdate',ms:Date.now()-began,old:a?.name,n:b.name});},death:()=>lost=true};
bot.clearControlStates();bot.pathfinder.setGoal(null);for(const[k,f]of Object.entries(handlers))bot.on(k,f);
try{
 if(bot.entity.position.floored().equals(new V(0,67,58))===false||bot.health!==3||!full(target)||!full(target.offset(0,-1,0)))throw Error('freshstart changed');
 sample('listener_smoke_start');await bot.waitForTicks(10);sample('listener_smoke_end');
 const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe');if(!pick)throw Error('pick absent');await bot.equip(pick,'hand');await bot.lookAt(target.offset(.5,.5,.5),false);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(target)||!c.intersect)throw Error('actualcursor');for(const h of[bot.entity.eyeHeight,1.8]){const o=bot.entity.position.offset(0,h,0),d=c.intersect.minus(o);if(d.norm()>4.5)throw Error('reach');const hit=bot.world.raycast(o,d.scaled(1/d.norm()),d.norm()-.01);if(hit&&!hit.position.equals(target))throw Error('obstruction');}
 console.log('DIG_ADMISSION',JSON.stringify({target,hit:c.intersect,face:c.face,digTime:bot.digTime(bot.blockAt(target)),actualEye:bot.entity.eyeHeight}));
 await bot.dig(bot.blockAt(target),false,'raycast');sample('dig_promise_return');
 for(let n=0;n<12;n++){await bot.waitForTicks(5);sample('settle_'+n);if(lost||bot.health<1)break;}
}finally{
 bot.clearControlStates();bot.pathfinder.setGoal(null);
 try{if(!lost&&bot.health>0&&bot.game.dimension==='the_nether'&&bot.entity.position.floored().equals(new V(0,67,58))&&!full(target)){const ref=target.offset(0,-1,0),item=bot.inventory.items().find(i=>i.name==='basalt');if(!item||!full(ref))throw Error('seal input/support');await bot.equip(item,'hand');await bot.lookAt(ref.offset(.5,1,.5),false);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(ref)||c.face!==1)throw Error('sealface');await bot.placeBlock(bot.blockAt(ref),new V(0,1,0));await bot.waitForTicks(20);}sample('final');}catch(e){console.log('SEAL_FAILURE',String(e));}
 for(const[k,f]of Object.entries(handlers))bot.removeListener(k,f);console.log('EVENTS',JSON.stringify(events));
}

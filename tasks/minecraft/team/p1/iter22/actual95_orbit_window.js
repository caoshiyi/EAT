const V=bot.entity.position.constructor;
const movement=new Movements(bot);movement.canDig=false;movement.allow1by1towers=false;movement.allowParkour=false;movement.allowSprinting=false;movement.scafoldingBlocks=[];movement.maxDropDown=1;bot.pathfinder.setMovements(movement);
async function goChecked(x,y,z,ms=9000){
 const before={p:bot.entity.position.clone(),hp:bot.health,dim:bot.game.dimension}; let timer;
 try{await Promise.race([bot.pathfinder.goto(new goals.GoalBlock(x,y,z)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('movement timeout')),ms)})]);}
 finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 for(let n=0;n<20&&!bot.entity.onGround;n++)await bot.waitForTicks(1);
 const p=bot.entity.position;
 const ok=bot.game.dimension===before.dim&&bot.health>0&&bot.health>=before.hp&&bot.entity.onGround&&Math.abs(p.y-y)<=.12&&Math.hypot(p.x-x-.5,p.z-z-.5)<=.8;
 console.log('CHECKED_LEG',JSON.stringify({target:[x,y,z],before,p,hp:bot.health,ground:bot.entity.onGround,goal:bot.pathfinder.goal,controls:bot.controlState,ok}));if(!ok)throw Error('physical postcondition failed');
}

let lost=false,issue=null;const died=()=>{lost=true;};bot.on('death',died);const samples=[],start=Date.now();
function state(){return {p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),goal:bot.pathfinder.goal,controls:bot.controlState};}
try{
 if(bot.game.dimension!=='the_end'||bot.health!==20||bot.inventory.items().length||bot.entity.position.distanceTo(new V(75.5,50,.5))>.8)throw Error('staging precondition');
 const origin=bot.entity.position.offset(0,1.62,0),up=bot.world.raycast(origin,new V(0,1,0),4),flat=bot.world.raycast(origin,new V(-1,0,0),3);
 console.log('RAY_SMALL_TEST',JSON.stringify({up:up?.position,flat:flat?.position}));if(!up?.position.equals(new V(75,52,0))||flat)throw Error('ray small test failed');
 for(let x=76;x<=95;x++){if(bot.blockAt(new V(x,49,0))?.boundingBox!=='block'||[50,51].some(y=>bot.blockAt(new V(x,y,0))?.boundingBox!=='empty'))throw Error('bridge changed '+x);}
 await goChecked(95,50,0);const exposure=Date.now();
 for(let n=0;n<200&&!lost&&Date.now()-exposure<20000&&bot.health===20;n++){
 const d=Object.values(bot.entities).find(e=>e.name==='ender_dragon');if(!d)throw Error('dragon absent');await bot.lookAt(d.position,true);
 const root=d.position.clone(),cp=Math.cos(bot.entity.pitch),dir=new V(-Math.sin(bot.entity.yaw)*cp,Math.sin(bot.entity.pitch),-Math.cos(bot.entity.yaw)*cp);
 const rays=[1.62,1.8].map(h=>{const o=bot.entity.position.offset(0,h,0),dist=o.distanceTo(root),hit=bot.world.raycast(o,dir,dist);return {h,dist,hit:hit?.position,intersect:hit?.intersect,clear:!hit};});
 const rec={elapsed:Date.now()-exposure,p:bot.entity.position.clone(),hp:bot.health,root,dragonHP:d.metadata?.[9],phase:d.metadata?.[16],rays,clear:rays.every(r=>r.clear),fireballs:Object.values(bot.entities).filter(e=>e.name?.includes('fireball')).map(e=>({id:e.id,p:e.position.clone()}))};samples.push(rec);if(n%10===0||rec.clear)console.log('ACTUAL95',JSON.stringify(rec));
 if(rec.clear)break;await bot.waitForTicks(2);
 }
}catch(e){issue=String(e);console.log('FAIL',issue);}finally{
 bot.pathfinder.setGoal(null);bot.clearControlStates();if(!lost&&bot.game.dimension==='the_end'){try{await goChecked(75,50,0);}catch(e){console.log('RETURN_FAIL',String(e));}}
 bot.removeListener('death',died);bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('FINAL',JSON.stringify({...state(),lost,issue,elapsed:Date.now()-start,visible:samples.filter(s=>s.clear).length,total:samples.length,phases:[...new Set(samples.map(s=>s.phase))],dragonHP:[...new Set(samples.map(s=>s.dragonHP))],samples:samples.filter((s,i)=>i%10===0||s.clear)}));
}

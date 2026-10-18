const V=require('vec3').Vec3;
const ring=[[39,0],[39,1],[39,2],[39,3],[40,3],[41,3],[42,3],[43,3],[44,3],[45,3],[45,2],[45,1],[45,0],[45,-1],[45,-2],[45,-3],[44,-3],[43,-3],[42,-3],[41,-3],[40,-3],[39,-3],[39,-2],[39,-1]];
const capNames=['end_stone','tuff','cobbled_deepslate','stone_bricks'];
function full(p){return bot.blockAt(p)?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');}
const normals=[new V(0,-1,0),new V(0,1,0),new V(0,0,-1),new V(0,0,1),new V(-1,0,0),new V(1,0,0)];
async function visible(p,required=null){const candidates=required===null?[p.offset(.5,.5,.5),p.offset(.35,.75,.65),p.offset(.65,.25,.35)]:[.35,.65,.25,.75].map((a,i)=>{const n=normals[required],b=i%2?.35:.65;const q=n.y?new V(a,n.y>0?1:0,b):n.z?new V(a,b,n.z>0?1:0):new V(n.x>0?1:0,a,b);return p.plus(q).minus(n.scaled(.015));});
 for(const aim of candidates){await bot.lookAt(aim,true);await bot.waitForTicks(1);const h=bot.blockAtCursor(4.5);if(h&&h.position.equals(p)&&(required===null||h.face===required)&&h.intersect&&[1.62,1.8].every(y=>bot.entity.position.offset(0,y,0).distanceTo(h.intersect)<=4.5))return {p:h.position,face:h.face,intersect:h.intersect,aim};}return null;}
async function digNative(p,log){const b=bot.blockAt(p);if(b.boundingBox==='empty')return;if(b.name!=='end_stone')throw Error('non-native dig '+p+' '+b.name);const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe')||bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(!pick)throw Error('no ordinary pick');await bot.equip(pick,'hand');const ray=await visible(p);if(!ray)throw Error('no visible dig '+p);log.push({kind:'dig_pre',p,ray,hp:bot.health});console.log('DIG_PRE',JSON.stringify(log.at(-1)));await bot.dig(b,'ignore',normals[ray.face]);await bot.waitForTicks(1);if(bot.blockAt(p).boundingBox!=='empty')throw Error('dig no physical effect');}
async function place(refp,f,dest,log){if(full(dest))return;const it=bot.inventory.items().find(i=>capNames.includes(i.name));if(!it)throw Error('no ordinary cap');await bot.equip(it,'hand');const ray=await visible(refp,f);if(!ray)throw Error('not visible place face '+refp+' '+f);const body=bot.entity.position;if(dest.y+1>body.y&&dest.y<body.y+1.8&&dest.x<body.x+.3&&dest.x+1>body.x-.3&&dest.z<body.z+.3&&dest.z+1>body.z-.3)throw Error('target overlaps body');console.log('PLACE_PRE',JSON.stringify({refp,f,dest,ray,body}));await bot.placeBlock(bot.blockAt(refp),normals[f]);await bot.waitForTicks(1);if(!full(dest))throw Error('place no physical effect');log.push({kind:'place',p:dest,n:bot.blockAt(dest).name,hp:bot.health});console.log('PLACE_EFFECT',JSON.stringify(log.at(-1)));}
async function moveCenter(x,y,z){await bot.pathfinder.goto(new goals.GoalBlock(x,y,z));bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(3);if(Math.abs(bot.entity.position.y-y)>.08||!bot.entity.onGround)throw Error('actual body not grounded');}
async function runSpiral(goalY,budgetMs){const begin=Date.now(),log=[],hp=bot.health;let issue=null;const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
 let state=global.P4Spiral20;
 try{
 if(bot.game.dimension!=='the_end')throw Error('not End');
 if(!state){await moveCenter(40,50,3);for(const [x,z] of [[40,2],[39,2],[39,1],[39,0]]){if(!full(new V(x,49,z))||!full(new V(x,52,z)))throw Error('native approach support/roof');await digNative(new V(x,51,z),log);await digNative(new V(x,50,z),log);await moveCenter(x,50,z);}state={steps:[{x:39,y:50,z:0}],level:0};global.P4Spiral20=state;}
 while(state.steps.at(-1).y<goalY){if(Date.now()-begin>budgetMs)throw Error('whole bounded partial');if(bot.health<14)throw Error('health below attack preparation minimum');const c=state.steps.at(-1),dxy=ring[(state.level+1)%ring.length],d={x:dxy[0],y:c.y+1,z:dxy[1]};
 if(Math.hypot(bot.entity.position.x-(c.x+.5),bot.entity.position.z-(c.z+.5))>.4||Math.abs(bot.entity.position.y-c.y)>.1)await moveCenter(c.x,c.y,c.z);
 await digNative(new V(c.x,c.y+2,c.z),log);await digNative(new V(d.x,d.y,d.z),log);await digNative(new V(d.x,d.y+1,d.z),log);
 const floor=new V(d.x,d.y-1,d.z);
 if(!full(floor)){
  let anchored=false;for(const [dx,dz,f] of [[1,0,4],[-1,0,5],[0,1,2],[0,-1,3]]){const r=floor.offset(dx,0,dz);if(bot.blockAt(r)?.name==='obsidian'&&await visible(r,f)){await place(r,f,floor,log);anchored=true;break;}}
  if(!anchored){const base=floor.offset(0,-1,0);if(!full(base)){const ref=new V(c.x,c.y-1,c.z),dx=d.x-c.x,dz=d.z-c.z,f=dx===1?5:dx===-1?4:dz===1?3:2;
   try{bot.setControlState('sneak',true);for(let t=0;t<30;t++){const p=bot.entity.position,tx=c.x+.5+dx*.60,tz=c.z+.5+dz*.60;if(Math.hypot(p.x-tx,p.z-tz)<.035)break;await bot.lookAt(new V(tx,p.y+1.62,tz),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}bot.setControlState('forward',false);await place(ref,f,base,log);}finally{bot.setControlState('forward',false);await moveCenter(c.x,c.y,c.z);}}
   await place(base,1,floor,log);
  }
 }
 if(!full(floor)||[0,1].some(i=>bot.blockAt(new V(d.x,d.y+i,d.z)).boundingBox!=='empty'))throw Error('step body/support afterbuild');await moveCenter(d.x,d.y,d.z);state.steps.push(d);state.level++;console.log('STAIR_BODY',JSON.stringify({level:state.level,p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,velocity:bot.entity.velocity,clouds:Object.values(bot.entities).filter(e=>e.name==='area_effect_cloud').map(e=>({p:e.position,r:e.metadata?.[8],h:e.height}))}));
 }
 }catch(e){issue=String(e);console.log('SPIRAL_FAIL',issue);if(state?.steps.length){const c=state.steps.at(-1);try{await moveCenter(c.x,c.y,c.z);}catch(r){console.log('RECOVERY_FAIL',String(r));}}}
 finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
 return {issue,elapsed:Date.now()-begin,hpBefore:hp,hp:bot.health,p:bot.entity.position,ground:bot.entity.onGround,level:state?.level,steps:state?.steps,log,inventory:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed}))};}

const fieldStart=Date.now(),events=[];let result=null,attack=null,issue=null;
async function walkPlane(x,z,sneak=true,budget=3000){const start=Date.now(),y0=bot.entity.position.y;bot.pathfinder.setGoal(null);bot.setControlState('sneak',sneak);bot.setControlState('sprint',false);bot.setControlState('jump',false);
 try{while(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.035){if(Date.now()-start>budget||bot.health<=0)throw Error('local walk budget/life');if(Math.abs(bot.entity.position.y-y0)>.7)throw Error('unexpected vertical motion');await bot.lookAt(new V(x,bot.entity.position.y+1.62,z),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}
 finally{bot.setControlState('forward',false);bot.setControlState('sneak',true);}await bot.waitForTicks(4);
}
async function slab(refp){const it=bot.inventory.items().find(i=>i.name==='cobbled_deepslate_slab');if(!it)throw Error('no actual slab');await bot.equip(it,'hand');const ray=await visible(refp,1);if(!ray)throw Error('slab TOP not directly visible');const dest=refp.offset(0,1,0);console.log('SLAB_PRE',JSON.stringify({refp,dest,ray,body:bot.entity.position}));await bot.placeBlock(bot.blockAt(refp),new V(0,1,0));await bot.waitForTicks(2);const b=bot.blockAt(dest);if(b.name!=='cobbled_deepslate_slab'||!b.shapes.some(v=>v[1]===0&&v[4]===.5))throw Error('actual lower HALF absent');console.log('SLAB_PHYSICAL',JSON.stringify({dest,n:b.name,shapes:b.shapes}));}
async function guardWest(z){await walkPlane(39.5,z+.5,true);const ref=new V(39,73,z),base=new V(38,73,z);
 if(!full(base)){try{await walkPlane(38.90,z+.5,true);await place(ref,4,base,events);}finally{await walkPlane(39.5,z+.5,true);}}
 await place(base,1,base.offset(0,1,0),events);await place(base.offset(0,1,0),1,base.offset(0,2,0),events);
}
try{
 result=await runSpiral(74,115000);if(result.issue)throw Error('ascent partial: '+result.issue);if(bot.health<14)throw Error('health below trial minimum');
 if(bot.blockAt(new V(40,74,0)).name!=='obsidian'||bot.blockAt(new V(40,75,0)).name!=='obsidian'||bot.blockAt(new V(40,76,0)).boundingBox!=='empty')throw Error('actual tower TOP76 assumption changed');
 // Two adjacent inner cells; use each as a standing tile while adding the other lower slab.
 await place(new V(40,73,1),4,new V(39,73,1),events);await moveCenter(39,74,1);await slab(new V(39,73,0));await walkPlane(39.5,.5,false);if(Math.abs(bot.entity.position.y-74.5)>.04)throw Error('actual half rise missing');await slab(new V(39,73,1));
 // Outer full bases and two-high west guard, all within ordinary visible reach.
 await guardWest(0);await guardWest(1);await walkPlane(39.68,.5,true);await bot.waitForTicks(5);
 console.log('GUARDED_STANCE',JSON.stringify({p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,velocity:bot.entity.velocity,west:[0,1].map(z=>[73,74,75].map(y=>({p:new V(38,y,z),n:bot.blockAt(new V(38,y,z)).name}))),inner:[0,1].map(z=>({p:new V(39,74,z),n:bot.blockAt(new V(39,74,z)).name,shapes:bot.blockAt(new V(39,74,z)).shapes}))}));
 if(Math.abs(bot.entity.position.y-74.5)>.04||!bot.entity.onGround||bot.health<14)throw Error('actual stance/health not qualified');
 const dragon=Object.values(bot.entities).find(e=>e.name==='ender_dragon');if(!dragon||dragon.metadata?.[9]<=0)throw Error('dragon absent/dying: evaluate objective before further combat');
 const e=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(new V(42.5,77,.5))<.3);if(!e)throw Error('target crystal absent before attack');
 if([1.62,1.8].some(y=>bot.entity.position.offset(0,y,0).distanceTo(e.position)>3))throw Error('actual root outside conservative3m');
 await bot.unequip('hand');let qualified=null;
 for(const dy of [.7,1.2,1.6]){const aim=e.position.offset(0,dy,0);await bot.lookAt(aim,true);await bot.waitForTicks(2);const target=bot.entityAtCursor(3),block=bot.blockAtCursor(3);const r={aim,root:e.position.clone(),body:bot.entity.position.clone(),yaw:bot.entity.yaw,pitch:bot.entity.pitch,entity:target&&{id:target.id,n:target.name},block:block&&{p:block.position,n:block.name,face:block.face,hit:block.intersect},rootDistances:[1.62,1.8].map(y=>bot.entity.position.offset(0,y,0).distanceTo(e.position))};console.log('ATTACK_VIEW',JSON.stringify(r));if(target?.id===e.id&&!block&&r.rootDistances.every(v=>v<=3)){qualified=r;break;}}
 if(!qualified)throw Error('no clear actual client target within3m');
 const before={p:bot.entity.position.clone(),hp:bot.health,velocity:bot.entity.velocity.clone(),crystalId:e.id,crystal:e.position.clone(),view:qualified,crystalCount:Object.values(bot.entities).filter(v=>v.name==='end_crystal').length};const gone=[];const onGone=v=>{if(v.id===e.id)gone.push({id:v.id,n:v.name,p:v.position.clone()})};bot.on('entityGone',onGone);
 try{bot.attack(e);await bot.waitForTicks(6);}finally{bot.removeListener('entityGone',onGone);}
 attack={before,after:{p:bot.entity.position.clone(),hp:bot.health,velocity:bot.entity.velocity.clone(),targetPresent:!!bot.entities[e.id],crystalCount:Object.values(bot.entities).filter(v=>v.name==='end_crystal').length},gone};console.log('ACTUAL_ONE_ATTACK',JSON.stringify(attack));
}catch(e){issue=String(e);console.log('CRYSTAL_FAIL',issue);}
finally{
 bot.pathfinder.setGoal(null);bot.clearControlStates();const st=global.P4Spiral20;
 if(bot.game.dimension==='the_end'&&bot.health>0&&st?.steps.length){
  const candidates=st.steps.slice(0,-1).reverse();for(const p of candidates){try{await moveCenter(p.x,p.y,p.z);console.log('DESCEND_BODY',JSON.stringify({p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround}));}catch(e){console.log('DESCENT_REFUSED',JSON.stringify({target:p,p:bot.entity.position,issue:String(e)}));break;}}
 }
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(5);
}
return {issue,attack,elapsed:Date.now()-fieldStart,p:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed})),clouds:Object.values(bot.entities).filter(e=>e.name==='area_effect_cloud').map(e=>({p:e.position,r:e.metadata?.[8],h:e.height})),events};

// Fresh normal jump/place experiment; reclaim and grounded ending in same caller.
const V=require('vec3').Vec3,begin=Date.now(),hp=bot.health,steps=[],reclaims=[];let issue=null;
const capNames=['oak_planks','cobbled_deepslate','stone_bricks','cracked_stone_bricks','mossy_stone_bricks','tuff','basalt'];
const base=new V(142,-37,2231),column=[new V(142,-36,2231),new V(142,-35,2231)];
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
function guard(){if(bot.health<hp||Date.now()-begin>40000)throw Error('health/budget');}
try{
 if(!bot.inventory.items().some(i=>i.name==='stone_pickaxe')||bot.inventory.items().filter(i=>capNames.includes(i.name)).reduce((s,i)=>s+i.count,0)<2)throw Error('loan not ordinary');
 if(Object.values(bot.entities).some(e=>e.type==='player'&&e.id!==bot.entity.id&&e.position.distanceTo(new V(142.5,-36,2231.5))<.85))throw Error('pillar occupied');
 for(let y=-36;y<=-32;y++){const b=bot.blockAt(new V(142,y,2231));if(b.boundingBox!=='empty')throw Error('vertical headroom '+y+':'+b.name);}
 await bot.pathfinder.goto(new goals.GoalBlock(142,-36,2231));bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(3);
 for(let n=0;n<2;n++){
  guard();const ref=bot.blockAt(n===0?base:column[n-1]),dest=column[n],y0=bot.entity.position.y;
  await bot.equip(bot.inventory.items().find(i=>capNames.includes(i.name)),'hand');await bot.lookAt(ref.position.offset(.35,.985,.65),true);await bot.waitForTicks(2);
  let hit=bot.blockAtCursor(4.5);if(!hit||!hit.position.equals(ref.position)||hit.face!==1)throw Error('floor TOP not direct');
  const before=bot.inventory.items().filter(i=>capNames.includes(i.name)).reduce((s,i)=>s+i.count,0);bot.setControlState('jump',true);
  let apex=false;for(let i=0;i<12;i++){await bot.waitForTicks(1);guard();if(bot.entity.position.y>y0+1.015){apex=true;break;}}
  if(!apex)throw Error('jump height unavailable');
  await bot.lookAt(ref.position.offset(.35,.985,.65),true);hit=bot.blockAtCursor(4.5);if(!hit||!hit.position.equals(ref.position)||hit.face!==1)throw Error('jump TOP not direct');
  console.log('UP_PRE',JSON.stringify({n,ref:ref.position,dest,p:bot.entity.position,vel:bot.entity.velocity,hit:{p:hit.position,face:hit.face,intersect:hit.intersect},before}));
  try{await bot.placeBlock(ref,new V(0,1,0));}finally{bot.setControlState('jump',false);}
  await bot.waitForTicks(12);const after=bot.inventory.items().filter(i=>capNames.includes(i.name)).reduce((s,i)=>s+i.count,0);
  const result={n,actual:bot.blockAt(dest).name,p:bot.entity.position.clone(),ground:bot.entity.onGround,hp:bot.health,before,after};steps.push(result);console.log('UP_EFFECT',JSON.stringify(result));
  if(!capNames.includes(result.actual)||Math.abs(result.p.y-(y0+1))>.05||!result.ground)throw Error('physical rise not established');
 }
}catch(e){issue=String(e);console.log('TEST_FAIL',issue);}finally{
 bot.clearControlStates();bot.pathfinder.setGoal(null);
 // Reclaim only own actually placed blocks, top down; current support ref below remains intact.
 for(const p of column.slice().reverse()){
  const b=bot.blockAt(p);if(!capNames.includes(b.name))continue;
  await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');await bot.lookAt(p.offset(.35,.985,.65),true);await bot.waitForTicks(2);const h=bot.blockAtCursor(4.5);
  if(!h||!h.position.equals(p)){reclaims.push({p,refused:'no direct ray'});continue;}
  await bot.dig(b,false,'raycast');await bot.waitForTicks(10);reclaims.push({p,actual:bot.blockAt(p).name,body:bot.entity.position.clone(),ground:bot.entity.onGround,hp:bot.health});
 }
 bot.clearControlStates();await bot.waitForTicks(5);
}
return {steps,reclaims,issue,elapsed:Date.now()-begin,p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,velocity:bot.entity.velocity,base:bot.blockAt(base).name,column:column.map(p=>({p,n:bot.blockAt(p).name})),inventory:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed}))};

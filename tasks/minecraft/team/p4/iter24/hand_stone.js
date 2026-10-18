const start=Date.now(), origin=bot.entity.position.clone(),base=origin.floored();
const full=b=>!!b?.shapes?.some(s=>s.length===6&&s.every((v,i)=>v===[0,0,0,1,1,1][i]));
const snapshot=()=>({at:new Date().toISOString(),pos:bot.entity.position,health:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),faces:[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>{const p=bot.entity.position.floored().offset(...d),b=bot.blockAt(p);return{p,name:b?.name,full:full(b)};})});
bot.clearControlStates();bot.pathfinder.setGoal(null);
if(base.x!==-9||base.y!==26||base.z!==-38||bot.health!==20||bot.game.dimension!=='overworld')throw Error('body guard');
const target=base.offset(1,1,0), below=target.offset(0,-1,0), beyond=target.offset(1,0,0), roof=target.offset(0,1,0);
const initial=snapshot();console.log('PRE',JSON.stringify(initial));
if(!initial.faces.every(c=>c.full)||!bot.entity.onGround)throw Error('shell');
const b=bot.blockAt(target);if(b?.name!=='stone'||!bot.canSeeBlock(b)||!full(bot.blockAt(below))||!full(bot.blockAt(beyond))||!full(bot.blockAt(roof)))throw Error('target/support guard');
if(!bot.inventory.items().some(i=>i.name==='gravel'&&i.count>=1))throw Error('cap budget');
if(Object.values(bot.entities).some(e=>['zombie','skeleton','creeper','spider'].includes(e.name)&&e.position.distanceTo(origin)<12))throw Error('hostile');
await bot.unequip('hand');console.log('HAND',bot.heldItem?.name??null,'digTime',bot.digTime(b));
let edited=false;try{
 await bot.dig(b,false,'raycast');edited=true;console.log('DIG_RETURN',Date.now()-start);
 for(let i=0;i<8;i++){await bot.waitForTicks(5);console.log('AFTER',JSON.stringify({ms:Date.now()-start,name:bot.blockAt(target)?.name,health:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),items:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(target)<4).map(e=>({pos:e.position,metadata:e.metadata}))}));if(bot.health<20)break;}
}finally{
 bot.clearControlStates();bot.pathfinder.setGoal(null);
 const now=bot.blockAt(target);if(now?.name==='air'){
  const cap=bot.inventory.items().find(i=>i.name==='gravel');if(!cap)throw Error('MISSING CAP');
  const ref=bot.blockAt(below);if(!full(ref)||!bot.canSeeBlock(ref))throw Error('CAP REF NOT VISIBLE');
  await bot.equip(cap,'hand');await bot.placeBlock(ref,base.offset(0,1,0).minus(base));console.log('CAP_PROMISE');await bot.waitForTicks(10);
 }
 for(let i=0;i<3;i++){console.log('END',JSON.stringify(snapshot()));await bot.waitForTicks(5);}
}
return {elapsed:Date.now()-start,edited};

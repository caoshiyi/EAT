// Requires overland_lib + strict centerDrop. First qualification must be ONE objective-linked step.
async function sealedDown(steps=1,stopY=-60){
 for(let k=0;k<steps;k++){
  life();bot.pathfinder.setGoal(null);bot.clearControlStates();const p=bot.entity.position.floored(),q=p.offset(0,-1,0);
  if(!shell(p)||!bot.entity.onGround)throw Error('SEALED_DOWN_START');
  if(p.y<=stopY)return {reason:'TARGET_Y',steps:k,p};
  const nextFloor=bot.blockAt(q.offset(0,-1,0)),b=bot.blockAt(q);
  const sides=dirs.map(d=>bot.blockAt(q.plus(d)));
  if(!full(nextFloor)||!sides.every(full))return {reason:'NATIVE_GAP_BEFORE_CUT',steps:k,p,below:nextFloor?.name,sides:sides.map(b=>[b.position,b.name])};
  if(!['dirt','grass_block','stone','granite','diorite','andesite','deepslate','tuff','cobblestone','cobbled_deepslate'].includes(b.name))return {reason:'SPECIAL_FLOOR_BEFORE_CUT',steps:k,p,floor:b.name};
  const reserve=()=>['cobblestone','cobbled_deepslate','granite','diorite','andesite','spruce_planks','dirt'].map(n=>bot.inventory.items().find(i=>i.name===n)).find(Boolean);
  if(!reserve())return {reason:'NO_HELD_CAP_BEFORE_CUT',steps:k,p};
  await centerDrop(p);
  const pick=bot.inventory.items().filter(i=>i.name.endsWith('_pickaxe')).sort((a,b)=>(a.name==='stone_pickaxe'?-1:1)-(b.name==='stone_pickaxe'?-1:1))[0];
  if(!['dirt','grass_block'].includes(b.name)){if(!pick)throw Error('DOWN_NEEDS_PICK');await bot.equip(pick,'hand')}else{const shovel=bot.inventory.items().find(i=>i.name.endsWith('_shovel'));if(shovel)await bot.equip(shovel,'hand');else await bot.unequip('hand')}
  await bot.dig(b,true,'raycast');await tick(2);if(full(bot.blockAt(q)))throw Error('DOWN_CUT_NO_ACK');
  for(let t=0;t<35&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.12);t++)await tick(1);
  if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.12)throw Error('DOWN_SETTLE');
  const roof=q.offset(0,2,0),d=dirs.find(d=>full(bot.blockAt(roof.plus(d))));
  if(!d||!reserve())throw Error('DOWN_RECAP_MISSING');
  await bot.equip(reserve(),'hand');await bot._placeBlockWithOptions(bot.blockAt(roof.plus(d)),d.scaled(-1),{forceLook:true});await tick(3);
  if(!shell(q))throw Error('DOWN_HULL_ACK');
  global.P1Overland={feet:q,roof,at:Date.now()};global.P1SurfaceBox=null;
  console.log('SEALED_DOWN_ACTUAL',JSON.stringify({p:bot.entity.position,hp:bot.health,floor:b.name,step:k+1}));
 }return {reason:'STEP_BUDGET',steps,p:bot.entity.position};
}

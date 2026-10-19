const hazards=()=>Object.values(bot.entities).filter(e=>['area_effect_cloud','dragon_fireball','ender_dragon'].includes(e.name)).map(e=>({id:e.id,name:e.name,p:e.position.clone()}));
async function riseCovered(){
 alive();if(bot.health<10)throw Error('forwardHP');const a=bot.entity.position.floored();console.log('RISE_PRE',JSON.stringify({state:state(),hazards:hazards()}));
 if(!bot.entity.onGround||!full(a.offset(0,-1,0)))throw Error('rise source');
 if(full(a.offset(0,2,0)))await cut(a.offset(0,2,0),['end_stone','basalt','blackstone','netherrack']);
 for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){
   const ref=a.offset(d[0],1,d[2]),q=ref.offset(0,1,0);
   if(full(q))continue;if(!full(ref))await put(ref,'end_stone');
   const wallName=['basalt','blackstone','end_stone','cobbled_deepslate','stone_bricks','mossy_stone_bricks','nether_bricks'].find(n=>count(n));if(!wallName)throw Error('wallfunding');await bot.equip(bot.inventory.items().find(i=>i.name===wallName),'hand');
   bot.setControlState('jump',true);
   try{for(let k=0;k<15&&bot.entity.position.y<a.y+.65;k++)await sleep(1);if(bot.entity.position.y<a.y+.65)throw Error('rise jump');await face(ref,1);await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}
   await sleep(12);if(!full(q))throw Error('rise side postcondition');
 }
 const pillarName=['basalt','blackstone','end_stone','cobbled_deepslate','stone_bricks','mossy_stone_bricks','nether_bricks'].find(n=>count(n));if(!pillarName)throw Error('pillarfunding');await pillar(pillarName);await seal();console.log('RISE_POST',JSON.stringify({state:state(),hazards:hazards()}));
}

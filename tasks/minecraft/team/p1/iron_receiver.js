const {Vec3}=require('vec3');
const q=new Vec3(-29,63,-41),back=q.offset(0,0,1);
let dead=false,received=false,staged=false,lastReady=0;
const full=b=>b?.shapes?.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);
const backSealed=()=>full(bot.blockAt(back))&&full(bot.blockAt(back.offset(0,1,0)));
const die=()=>{dead=true;bot.pathfinder.setGoal(null);bot.clearControlStates()};
const onChat=(u,m)=>{if(u==='p3'&&m.startsWith('P3_STAGE_IRON_V1'))staged=true;};
bot.on('death',die);bot.on('chat',onChat);
function life(){if(dead||bot.health<=0||bot.game.dimension!=='the_nether')throw Error('LIFE_DISCONTINUITY')}
async function plug(p){
 if(full(bot.blockAt(p)))return;
 const i=bot.inventory.items().find(i=>['basalt','blackstone','netherrack','cobblestone'].includes(i.name));
 if(!i)throw Error('NO_SEAL_MATS');bot.deactivateItem();await bot.equip(i,'hand');await bot.waitForTicks(4);
 await bot.placeBlock(bot.blockAt(p.offset(0,-1,0)),new Vec3(0,1,0));await bot.waitForTicks(6);life();
 if(!full(bot.blockAt(p)))throw Error('SEAL_POST');
}
try{
 life();bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);life();
 if(bot.entity.position.distanceTo(q.offset(.5,0,.5))>.65)throw Error('WRONG_RECEIVER_BODY');
 if(bot.inventory.items().some(i=>i.name==='iron_pickaxe'))throw Error('ALREADY_HAS_IRON_PICK');
 bot.chat('P1_IRON_ARMED_V1');console.log('RECEIVER_START',bot.entity.position.toString(),bot.health,bot.food);
 const end=Date.now()+120000;
 while(Date.now()<end){
  life();const e=bot.players.p3?.entity;
  if(e&&e.position.distanceTo(new Vec3(-28.5,63,-38.5))<1.1&&Date.now()-lastReady>2000){
   bot.chat('P1_IRON_READY_V1');lastReady=Date.now();console.log('SENDER_STAGE_ACTUAL',e.position.toString());
  }
  if(bot.inventory.items().some(i=>i.name==='iron_pickaxe'&&i.durabilityUsed===0)){
   received=true;console.log('IRON_PICK_ACTUAL_RECEIPT',bot.inventory.items().filter(i=>i.name.includes('pickaxe')).map(i=>[i.name,i.count,i.durabilityUsed]));
   bot.chat('P1_IRON_RECEIVED_V1');break;
  }
  await bot.waitForTicks(4);
 }
 if(!received)console.log('NO_IRON_RECEIPT');
}finally{
 try{
  if(!dead){
   const end=Date.now()+20000;
   while(Date.now()<end&&!backSealed()){life();await bot.waitForTicks(4);}
   if(!backSealed()){
    const e=bot.players.p3?.entity;
    if(e&&e.position.distanceTo(back.offset(.5,0,.5))<6)console.log('P3_SEAL_OWNER_STILL_NEAR no concurrent placement');
    else{await plug(back);await plug(back.offset(0,1,0));}
   }
   console.log('RECEIVER_BACK_SEALED',backSealed());
  }
 }finally{
  bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',die);bot.removeListener('chat',onChat);
  const a=bot.inventory.items().find(i=>i.name==='stone_axe');if(a){await bot.equip(a,'hand');await bot.waitForTicks(4);bot.activateItem(true);}
  console.log('POST',bot.entity.position.toString(),bot.health,bot.food,'dead',dead,'receipt',received,'inv',bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]));
 }
}

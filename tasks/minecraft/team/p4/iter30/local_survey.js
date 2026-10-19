const {Vec3}=require('vec3'),p=bot.entity.position.clone();
const wanted=['oak_log','birch_log','spruce_log','jungle_log','acacia_log','dark_oak_log','chest','crafting_table','iron_ore','coal_ore','wheat','carrots','potatoes','sweet_berry_bush','water'];
const found=wanted.filter(n=>n!=='water').flatMap(n=>bot.findBlocks({matching:b=>b.name===n,maxDistance:40,count:3}).map(q=>({p:q,n,d:q.distanceTo(p)})));
const head=bot.blockAt(p.offset(0,1.62,0).floored()),body=bot.blockAt(p.floored()),floor=bot.blockAt(p.floored().offset(0,-1,0));
console.log('LOCAL_SURVEY',JSON.stringify({at:new Date().toISOString(),p,hp:bot.health,food:bot.food,ground:bot.entity.onGround,isInWater:bot.entity.isInWater,oxygen:bot.oxygenLevel,head:{n:head?.name,p:head?.position},body:{n:body?.name,p:body?.position},floor:{n:floor?.name,p:floor?.position},time:{timeOfDay:bot.time.timeOfDay,isDay:bot.time.isDay},weather:{rain:bot.isRaining},found,livestock:Object.values(bot.entities).filter(e=>['cow','pig','sheep','chicken','rabbit','item'].includes(e.name)).map(e=>({n:e.name,p:e.position.clone(),d:e.position.distanceTo(p)}))}));
return {hp:bot.health,p};

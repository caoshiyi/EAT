// LIVE P3 negative-case smoke only. No attack, swing, interaction or movement.
const p=bot.entity.position.clone(),V=p.constructor;
if(bot.game.dimension!=='overworld'||p.distanceTo(new V(6.5,67,82.5))>.05)throw Error('unexpected body');
await bot.lookAt(p.offset(0,bot.entity.eyeHeight,-1),true);
const b=bot.blockAtCursor(3.0),e=bot.entityAtCursor(3.0);
return {at:new Date().toISOString(),kind:'NEGATIVE_CURSOR_SMOKE_NO_ATTACK',p,hp:bot.health,food:bot.food,block:b?{name:b.name,p:b.position,face:b.face,intersect:b.intersect}:null,entity:e?{id:e.id,name:e.name,p:e.position,width:e.width,height:e.height}:null,attackMethod:typeof bot.attack,flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

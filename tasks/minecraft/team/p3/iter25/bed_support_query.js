// LIVE P3 read-only requested support query; no interactions or movement.
const V=bot.entity.position.constructor;
if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(new V(6.5,67,82.5))>.05)throw Error('donor body mismatch');
const rows=[];for(let x=6;x<=8;x++)for(let y=64;y<=67;y++)for(let z=82;z<=84;z++){const p=new V(x,y,z),b=bot.blockAt(p);rows.push({p,n:b?.name,shapes:b?.shapes,full:!!b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')});}
return{at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),rows,flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

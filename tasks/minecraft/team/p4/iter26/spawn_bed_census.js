const V=bot.entity.position.constructor, now=()=>new Date().toISOString();
const before={at:now(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count])};
const beds=bot.findBlocks({matching:b=>/_bed$/.test(b.name),maxDistance:96,count:128});
const rows=beds.map(q=>{const b=bot.blockAt(q);return{p:q,name:b?.name,properties:b?.getProperties(),below:bot.blockAt(q.offset(0,-1,0))?.name,above:bot.blockAt(q.offset(0,1,0))?.name,neighbors:[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]].map(d=>({p:q.offset(...d),name:bot.blockAt(q.offset(...d))?.name,below:bot.blockAt(q.offset(d[0],-1,d[2]))?.name}))};});
console.log('SPAWN_BED_CENSUS',JSON.stringify({env:'LIVE iteration26',before,radius:96,rows,note:'Loaded actual blocks only; availability is not visibility/reach/travel/pickup qualification. No block interaction or movement.'}));
return{before,after:{at:now(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count])},parts:rows.length,distinctFootParts:rows.filter(r=>r.properties?.part==='foot').length};

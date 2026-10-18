// Read-only loaded-world public census. No movement, cut, open or use.
const V=bot.entity.position.constructor;
const beds=Object.values(bot.registry.blocksByName).filter(b=>b.name.endsWith('_bed')).map(b=>b.id);
const ps=bot.findBlocks({matching:beds,maxDistance:96,count:1024});
const rows=ps.map(q=>{const b=bot.blockAt(q);return{p:q,n:b?.name,props:b?.getProperties(),distance:q.distanceTo(bot.entity.position)};});
const feet=rows.filter(r=>r.props?.part==='foot').map(r=>{const d={east:[1,0,0],west:[-1,0,0],north:[0,0,-1],south:[0,0,1]}[r.props.facing];const head=d?bot.blockAt(r.p.offset(...d)):null;return{...r,head:head?{p:head.position,n:head.name,props:head.getProperties()}:null};});
return{at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,inv:bot.inventory.items().map(i=>[i.name,i.count]),partCount:rows.length,distinctFootCount:feet.length,feet,warning:'Loaded-model source census only, no LOS/reach/pickup/travel/transfer qualification. P3 source unchanged.'};

// Read-only p3; no source harvesting or movement.
const V=bot.entity.position.constructor;
console.log('BODY',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food}));
for(let x=5;x<=10;x++)for(let z=89;z<=94;z++){
const rows=[];for(let y=65;y<=72;y++){const b=bot.blockAt(new V(x,y,z));rows.push([y,b?.name??'UNLOADED',!!b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')]);}
console.log('SNOW_AREA',JSON.stringify({x,z,rows}));}
for(const q of[new V(6,68,84),new V(7,69,84),new V(6,70,82),new V(8,67,92)]){
await bot.lookAt(q.offset(.5,.0625,.5),true);const c=bot.blockAtCursor(4.5);
console.log('OWN_SOURCE_VIEW',JSON.stringify({target:q,block:bot.blockAt(q)?.name,hit:c?.position,name:c?.name,intersect:c?.intersect,visible:!!c?.position.equals(q)}));}
return {p:bot.entity.position,hp:bot.health,food:bot.food,inventory:bot.inventory.items().map(i=>[i.name,i.count]),readOnly:true};

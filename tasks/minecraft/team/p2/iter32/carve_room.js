async function carveRoom(){
 stop();await wait(3);const s=bot.entity.position.floored(),ds=[v(1,0,0),v(-1,0,0),v(0,0,1),v(0,0,-1)],options=[];
 const removable=q=>['stone','dirt','grass_block','cobblestone','andesite','diorite','granite','deepslate','air','cave_air'].includes(bot.blockAt(q)?.name);
 for(let dx=-5;dx<=5;dx++)for(let dz=-5;dz<=5;dz++)for(let dy=-1;dy<=2;dy++){
  const q=s.offset(dx,dy,dz);if(!full(q.offset(0,-1,0))||!full(q.offset(0,2,0))||['sand','gravel'].includes(bot.blockAt(q.offset(0,2,0))?.name)||!removable(q)||!removable(q.offset(0,1,0)))continue;
  if(!ds.every(d=>{const w=q.plus(d);return (full(w)||bot.blockAt(w)?.name==='air')&&(full(w.offset(0,1,0))||bot.blockAt(w.offset(0,1,0))?.name==='air')&&(full(w)||full(w.offset(0,-1,0)));}))continue;
  const names=['dirt','cobblestone','cobbled_deepslate','granite','diorite','andesite','spruce_planks'];const carried=bot.inventory.items().filter(i=>names.includes(i.name)).reduce((a,i)=>a+i.count,0),drops=[q,q.offset(0,1,0)].filter(w=>full(w)).length,need=ds.reduce((a,d)=>a+[q.plus(d),q.plus(d).offset(0,1,0)].filter(w=>!full(w)).length,0);if(carried+drops<need)continue;
  for(const d of ds){const e=q.plus(d);if(full(e.offset(0,-1,0))&&bot.blockAt(e)?.name==='air'&&bot.blockAt(e.offset(0,1,0))?.name==='air')options.push({q,e});}
 }
 options.sort((a,b)=>a.e.distanceTo(bot.entity.position)-b.e.distanceTo(bot.entity.position));if(!options.length)throw Error('no carved room admission');const {q,e}=options[0];console.log('CARVE_ADMISSION',JSON.stringify({q,e,state:state()}));await walk(e.x,e.y,e.z,5000,1);await cut(q.offset(0,1,0));await cut(q);await walk(q.x,q.y,q.z,3500,1);for(const d of ds)for(const y of[0,1]){const w=q.plus(d).offset(0,y,0);if(!full(w))await placeAt(w,material());}for(let k=0;k<3;k++){const faces=boundary();console.log('ENDING',JSON.stringify({...state(),faces,kind:'carved'}));if(!faces.every(f=>f.full))throw Error('carved post');await wait(4);}global.p2ShelterKind='carved';global.p2Door={x:e.x,y:e.y,z:e.z};return q;
}

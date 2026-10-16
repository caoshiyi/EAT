const {Vec3}=require('vec3');
if(bot.game.dimension!=='the_nether')throw Error('BODY');
const rows=[];
for(let x=-71;x>=-115;x--){
 const blocks=[];
 for(const y of[61,62,63,64,65])blocks.push(bot.blockAt(new Vec3(x,y,-141))?.name);
 rows.push([x,blocks]);
}
console.log('WEST_SHORE_SCAN',JSON.stringify(rows));
const candidates=[];
for(const dz of[-2,-1,0,1,2]){
 const xs=[];
 for(let x=-71;x>=-115;x--){
  const b=bot.blockAt(new Vec3(x,62,-141+dz));
  if(b?.boundingBox==='block'&&!['magma_block','lava'].includes(b.name))xs.push(x);
 }
 candidates.push([dz,xs]);
}
console.log('NATURAL_FLOOR_CANDIDATES',JSON.stringify(candidates));
console.log('UNCHANGED_BODY',bot.entity.position.toString(),bot.health,bot.food);

// Observation only. Real blocks, ordinary view rays, <=4.5m. Never place/use/move.
async function auditNearbyBedView() {
 const V=bot.entity.position.constructor, out=[];
 const beds=bot.findBlocks({matching:b=>/_bed$/.test(b.name),maxDistance:5,count:8});
 for(const q of beds){const b=bot.blockAt(q);if(!b||!/_bed$/.test(b.name))continue;
  const row={at:new Date().toISOString(),p:q,name:b.name,properties:b.getProperties(),shapes:b.shapes,views:[]};
  for(const s of b.shapes||[]){
   const aim=q.offset((s[0]+s[3])/2,s[4]-.005,(s[2]+s[5])/2);
   const rays=[bot.entity.eyeHeight,1.8].map(h=>{const eye=bot.entity.position.offset(0,h,0),d=aim.minus(eye),distance=d.norm();const hit=distance>0?bot.world.raycast(eye,d.scaled(1/distance),Math.max(0,distance-.02)):null;return{eyeHeight:h,distance,hit:hit?{p:hit.position,name:hit.name}:null};});
   await bot.lookAt(aim,true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);
   row.views.push({aim,rays,cursor:c?{p:c.position,name:c.name,face:c.face,intersect:c.intersect}:null,qualified:rays.every(r=>r.distance<=4.5&&(!r.hit||(r.hit.p.x===q.x&&r.hit.p.y===q.y&&r.hit.p.z===q.z)))&&!!c?.position.equals(q)});
  }
  out.push(row);
 }
 console.log('BED_VIEW_AUDIT',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,dimension:bot.game.dimension,beds:out,note:'Clear view is not blast safety or placement/activation success. Actual owner action and retreat remain separate.'}));return out;
}

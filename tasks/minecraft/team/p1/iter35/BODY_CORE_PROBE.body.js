// READ ONLY. Public 1.20.4 body5x3, horizontaloffset<=.5 => innerroot±2 XZ, rootY..+3.
// Cursor search radius fixes client entity-origin prefilter, NOT physical reach. No attack here.
async function probeDragonBodyCore(){
 const e=Object.values(bot.entities).find(e=>e.name==='ender_dragon');const report={at:new Date().toISOString(),player:bot.entity.position.clone(),hp:bot.health,observations:[],candidate:null};if(!e)return report;
 report.root={id:e.id,p:e.position.clone(),phase:e.metadata?.[16],hp:e.metadata?.[9]};
 const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),nearest=eye.clone();for(const k of ['x','z'])nearest[k]=Math.max(e.position[k]-1.99,Math.min(e.position[k]+1.99,eye[k]));nearest.y=Math.max(e.position.y+.01,Math.min(e.position.y+2.99,eye.y));
 const points=[nearest,e.position.offset(0,1.5,0),e.position.offset(0,2,0)];
 for(const point of points){let eyeNow=bot.entity.position.offset(0,bot.entity.eyeHeight,0),delta=point.minus(eyeNow),dist=delta.norm();if(dist<.01||dist>3)continue;let h=bot.world.raycast(eyeNow,delta.scaled(1/dist),dist);if(h){report.observations.push({point,dist,blocked:h.name,at:h.position});continue;}
  await bot.lookAt(point,true);await bot.waitForTicks(1);const current=bot.entities[e.id];if(!current)break;eyeNow=bot.entity.position.offset(0,bot.entity.eyeHeight,0);delta=point.minus(eyeNow);dist=delta.norm();const inside=Math.abs(point.x-current.position.x)<=1.99&&Math.abs(point.z-current.position.z)<=1.99&&point.y>=current.position.y+.01&&point.y<=current.position.y+2.99;if(!inside||dist<.01||dist>3)continue;h=bot.world.raycast(eyeNow,delta.scaled(1/dist),dist);if(h)continue;
  const queryRadius=Math.min(16,Math.max(3.5,current.position.distanceTo(bot.entity.position)+.1)),cursor=bot.entityAtCursor(queryRadius);const obs={at:new Date().toISOString(),point,eye:eyeNow,physicalPointDistance:dist,insideGuaranteedBodyCore:inside,rootOriginDistance:current.position.distanceTo(eyeNow),queryRadius,cursorId:cursor?.id,cursorName:cursor?.name,currentRoot:current.position.clone()};report.observations.push(obs);if(cursor?.id===current.id){report.candidate=obs;break;}
 }
 return report;
}
global.p1LastBodyCoreProbe=await probeDragonBodyCore();console.log('BODY_CORE_PROBE',JSON.stringify(global.p1LastBodyCoreProbe));

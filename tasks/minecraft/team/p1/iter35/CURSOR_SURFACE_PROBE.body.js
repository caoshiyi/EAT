// Read-only: public root box is a hypothesis. No attacks or movement, only ordinary look/cursor query.
const rootProbeDragon=Object.values(bot.entities).find(e=>e.name==='ender_dragon');
const rootProbeEye=bot.entity.position.offset(0,bot.entity.eyeHeight,0);
const rootProbeReport={at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,root:rootProbeDragon?{id:rootProbeDragon.id,p:rootProbeDragon.position.clone(),w:rootProbeDragon.width,h:rootProbeDragon.height,phase:rootProbeDragon.metadata?.[16]}:null,observations:[]};
if(rootProbeDragon){
 const e=rootProbeDragon,lo=e.position.offset(-e.width/2,0,-e.width/2),hi=e.position.offset(e.width/2,e.height,e.width/2);
 const near=rootProbeEye.clone();for(const k of ['x','y','z'])near[k]=Math.max(lo[k]+.01,Math.min(hi[k]-.01,near[k]));
 rootProbeReport.rootOriginDistance=e.position.distanceTo(rootProbeEye);rootProbeReport.boxDistance=near.distanceTo(rootProbeEye);
 const pts=[near,e.position.offset(0,.01,0),e.position.offset(0,.5,0),e.position.offset(0,e.height/2,0)];
 for(const point of pts){const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),delta=point.minus(eye),dist=delta.norm();if(dist>3||dist<.001)continue;const h=bot.world.raycast(eye,delta.scaled(1/dist),dist);if(h){rootProbeReport.observations.push({point,dist,block:h.name,p:h.position});continue;}
  await bot.lookAt(point,true);await bot.waitForTicks(1);const cursor=bot.entityAtCursor(3);rootProbeReport.observations.push({point,dist,rootOriginDistanceNow:e.position.distanceTo(bot.entity.position.offset(0,bot.entity.eyeHeight,0)),cursorId:cursor?.id,cursorName:cursor?.name,currentRoot:e.position.clone()});if(cursor?.id===e.id)break;
 }
}
console.log('ROOT_SURFACE_PROBE',JSON.stringify(rootProbeReport));

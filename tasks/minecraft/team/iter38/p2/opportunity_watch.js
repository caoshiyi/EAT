// Read-only p2 observation. Root-core geometry matches P1; no LOS claim.
const start=Date.now(), duration=90000, samples=[],events=[];
let min=Infinity,minLift=Infinity,near=0,n=0,oldHP=null,closest=null,ownHP=bot.health;
while(Date.now()-start<duration){
 const p=bot.players.p1?.entity,d=Object.values(bot.entities).find(e=>e.name==='ender_dragon');
 if(p&&d){const pp=p.position,dp=d.position,eye=pp.y+1.62;
 const dx=Math.max(dp.x-1.95-pp.x,0,pp.x-dp.x-1.95),dz=Math.max(dp.z-1.95-pp.z,0,pp.z-dp.z-1.95);
 const dist=lift=>Math.hypot(dx,dz,Math.max(dp.y+.05-eye-lift,0,eye+lift-dp.y-2.95));
 const a=dist(0),b=dist(1.25),r={at:new Date().toISOString(),a,b,p:pp.clone(),dp:dp.clone(),hp:d.metadata?.[9],p1hp:p.metadata?.[9]};
 n++;if(a<min){min=a;closest=r;}minLift=Math.min(minLift,b);if(a<=3)near++;if(n%4===0&&samples.length<500)samples.push(r);
 if(oldHP!==r.hp){events.push({at:r.at,hp:r.hp});oldHP=r.hp;}
 if(r.hp<=0||r.p1hp<20||bot.health<ownHP)break;
 }await bot.waitForTicks(1);
}
const result={at:new Date().toISOString(),ms:Date.now()-start,n,min,minHypotheticalLift125:minLift,actualNearTicks:near,closest,events,ending:{p:bot.entity.position.clone(),hp:bot.health,food:bot.food,goal:bot.pathfinder.goal,controls:bot.controlState}};
global.p2Opportunity={result,samples};console.log('P2_OPPORTUNITY',JSON.stringify(result));

// Caller: detach(); global.p1ContactRaw={events:h.events.slice(),tail:h.ring.slice()};
// Print actual ENDSTATE first, then JSON.stringify(compactContactReceipt(h,bot)).
// Full data stays in that player's global memory; never dump entire rings into arena output.
function compactContactReceipt(h,bot,cap=2800){
  const num=x=>typeof x==='number'?Math.round(x*1000)/1000:null;
  const sample=(r,t)=>r?[r.t-t,r.hp,...r.p.map(num),num(r.yaw),num(r.pitch),r.handFlags??null,r.shieldWear??null,...(r.dragon?.p||[null,null,null]).map(num)]:null;
  const source=h.events||[],chosen=source.slice(-4);
  const out={at:new Date().toISOString(),state:{p:[bot.entity.position.x,bot.entity.position.y,bot.entity.position.z].map(num),hp:bot.health,food:bot.food},eventCount:source.length,omittedEvents:Math.max(0,source.length-chosen.length),columns:['dtMs','hp','x','y','z','yaw','pitch','rawHandFlags','shieldWear','rootX','rootY','rootZ'],events:chosen.map(e=>({kind:e.kind,t:e.at?.t,ownId:e.ownId,packet:e.packet?[e.packet.entityId,e.packet.sourceTypeId,e.packet.sourceCauseId,e.packet.sourceDirectId]:null,at:sample(e.at,e.at?.t||0),preCount:e.before?.length||0,pre:(e.before||[]).slice(-3).map(r=>sample(r,e.at?.t||0))}))};
  while(JSON.stringify(out).length>cap&&out.events.some(e=>e.pre.length>1)){const e=out.events.find(e=>e.pre.length>1);e.pre.shift();}
  while(JSON.stringify(out).length>cap&&out.events.length){out.events.shift();out.omittedEvents++;}
  return out;
}

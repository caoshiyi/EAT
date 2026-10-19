const e=Object.values(bot.entities).find(e=>e.name==='ender_dragon'),p=Object.values(bot.entities).find(e=>e.username==='p1');const r={at:new Date().toISOString(),dragon:e?{p:e.position.clone(),hp:e.metadata?.[9],phase:e.metadata?.[16]}:null,p1:p?{p:p.position.clone(),hp:p.metadata?.[9]}:null,p3:{p:bot.entity.position.clone(),hp:bot.health,food:bot.food}};console.log('EFFECT',JSON.stringify(r));

console.log('REPAIR_GEOMETRY',JSON.stringify({at:new Date().toISOString(),cells:[v(-4,57,4),v(-4,58,4)].map(q=>({q,n:bot.blockAt(q)?.name})),baitRoof52:bot.blockAt(v(-5,52,4))?.name}));

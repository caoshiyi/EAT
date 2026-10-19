const e=Object.values(bot.entities).find(e=>e.name==='ender_dragon'),p=Object.values(bot.entities).find(e=>e.username==='p1');const r={at:new Date().toISOString(),dragon:e?{p:e.position.clone(),hp:e.metadata?.[9],phase:e.metadata?.[16]}:null,p1:p?{p:p.position.clone(),hp:p.metadata?.[9]}:null,p3:{p:bot.entity.position.clone(),hp:bot.health,food:bot.food}};console.log('EFFECT',JSON.stringify(r));

console.log('LOWER_APERTURE',JSON.stringify([[1,0],[-1,0],[0,1],[0,-1]].map(([x,z])=>[55,56].map(y=>{const q=v(-5+x,y,4+z);return{q,n:bot.blockAt(q)?.name};}))));

const dragon=Object.values(bot.entities).find(e=>e.name==='ender_dragon'),p1=bot.players.p1?.entity;
const r={at:new Date().toISOString(),own:{p:bot.entity.position,hp:bot.health,food:bot.food,controls:bot.controlState,goal:bot.pathfinder.goal},p1:p1?{p:p1.position,hp:p1.metadata?.[9]}:null,dragon:dragon?{id:dragon.id,hp:dragon.metadata?.[9],phase:dragon.metadata?.[16],p:dragon.position}:null};
console.log('EFFECT_RECEIPT',JSON.stringify(r));
if(typeof dragon?.metadata?.[9]==='number')bot.chat('P3 independent settled receipt '+r.at+': dragonHP'+dragon.metadata[9]+' P1HP'+r.p1?.hp+' P3HP'+bot.health+'; P1feetY'+p1?.position.y+'. Native effect, combat ending pending.');
global.p3LatestReceipt=r;

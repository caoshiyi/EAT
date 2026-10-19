const d=Object.values(bot.entities).find(e=>e.name==='ender_dragon'),p=bot.players.p1?.entity;
const r={at:new Date().toISOString(),own:{p:bot.entity.position.clone(),hp:bot.health,food:bot.food,controls:{...bot.controlState},goal:bot.pathfinder.goal},p1:p?{p:p.position.clone(),hp:p.metadata?.[9]}:null,dragon:d?{id:d.id,p:d.position.clone(),hp:d.metadata?.[9],phase:d.metadata?.[16]}:null};
console.log('RECEIPT',JSON.stringify(r));
const prev=global.p3LatestReceipt;
if(typeof r.dragon?.hp==='number'&&typeof prev?.dragon?.hp==='number'&&r.dragon.hp<prev.dragon.hp)bot.chat('P3 independent settled HP '+prev.dragon.hp+' -> '+r.dragon.hp+' at '+r.at+'; P1HP'+r.p1?.hp+' feetY'+r.p1?.p.y+' P3HP'+r.own.hp+'. Ending separate; coordinator owns eval.');
if(r.p1?.hp<20&&(!prev?.p1||r.p1.hp<prev.p1.hp))bot.chat('P3 observed P1 injury HP'+r.p1.hp+' feetY'+r.p1.p.y+' at '+r.at+'; primary owns recovery; P3fixedHP'+r.own.hp+'.');
if(!d&&prev?.dragon)bot.chat('P3 dragon entity absent at '+r.at+'; absence alone is NOT victory, please coordinator reconcile native/end/eval.');
global.p3LatestReceipt=r;

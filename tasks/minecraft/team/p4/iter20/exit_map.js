const V=require('vec3').Vec3;const out=[];
for(let x=129;x<=133;x++)for(let y=-38;y<=-34;y++){
const b=bot.blockAt(new V(x,y,2274));out.push({pos:b.position,name:b.name,shapes:b.shapes});}
return {out,nearPlayers:Object.values(bot.entities).filter(e=>e.type==='player').map(e=>({user:e.username,pos:e.position})),pos:bot.entity.position};

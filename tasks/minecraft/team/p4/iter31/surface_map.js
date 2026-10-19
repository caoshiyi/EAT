const p=bot.entity.position.clone(),q=p.floored(),rows=[];
for(let dz=-8;dz<=32;dz+=4){const row=[];for(let dx=-24;dx<=24;dx+=4){let top=null;for(let dy=20;dy>=-8;dy--){const b=bot.blockAt(q.offset(dx,dy,dz));if(b&&b.name!=='air'&&!['snow','tall_grass','grass'].includes(b.name)){top=[dy,b.name];break;}}row.push([q.x+dx,top]);}rows.push({z:q.z+dz,row});}
console.log('MAP',JSON.stringify({at:new Date().toISOString(),p,hp:bot.health,food:bot.food,ground:bot.entity.onGround,rows}));

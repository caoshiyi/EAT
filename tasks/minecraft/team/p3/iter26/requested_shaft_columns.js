const V=bot.entity.position.constructor;
for(const x of[8,9])for(const z of[83,89,91]){const rows=[];for(let y=58;y<=71;y++){const p=new V(x,y,z),b=bot.blockAt(p);rows.push({y,n:b?.name,sides:[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>bot.blockAt(p.offset(dx,0,dz))?.name)});}console.log('SHAFT_COLUMN',JSON.stringify({x,z,sideOrder:['E','W','S','N'],rows}));}
return {at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,readOnly:true};

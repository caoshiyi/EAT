const {Vec3}=require('vec3'),out=[];
for(let x=-7;x<=3;x++)for(let z=-26;z<=-24;z++){let cells=[];for(let y=55;y<=66;y++){const b=bot.blockAt(new Vec3(x,y,z));if(b&&b.name!=='air')cells.push([y,b.name]);}out.push({x,z,cells});}
console.log('TERRAIN',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,health:bot.health,terrain:out}));

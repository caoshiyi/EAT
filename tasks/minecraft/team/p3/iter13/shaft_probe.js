const{Vec3}=require('vec3');let cells=[];for(let x=5;x<=7;x++)for(let z=81;z<=84;z++)for(let y=62;y<=66;y++)cells.push([x,y,z,bot.blockAt(new Vec3(x,y,z))?.name]);return{p:bot.entity.position,cells};

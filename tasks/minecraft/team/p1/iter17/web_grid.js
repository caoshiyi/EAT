const{Vec3}=require('vec3');let cols=[];for(let z=2236;z<=2241;z++)for(let x=141;x<=144;x++)cols.push([x,z,[-37,-36,-35,-34,-33,-32,-31].map(y=>bot.blockAt(new Vec3(x,y,z))?.name)]);return cols;

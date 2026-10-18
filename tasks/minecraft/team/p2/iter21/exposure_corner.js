const V=require('vec3').Vec3;return{body:bot.entity.position,hp:bot.health,cells:[44,45,46,47].flatMap(x=>[0,1,2,3].map(z=>({x,z,n:[49,50,51,52].map(y=>bot.blockAt(new V(x,y,z))?.name)})))};

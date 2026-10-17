const{Vec3}=require('vec3');return [...Array(5)].flatMap((_,i)=>[...Array(6)].map((_,j)=>{const q=new Vec3(18+i,63+j,111),b=bot.blockAt(q);return[q,b?.name,b?.boundingBox]}));

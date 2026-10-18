const V=require('vec3').Vec3;const sites=[];
for(let x=126;x<=132;x++)for(let z=2266;z<=2273;z++){
const f=bot.blockAt(new V(x,-37,z));if(!f||!f.shapes.some(s=>s.join(',')==='0,0,0,1,1,1'))continue;
if([-36,-35].some(y=>bot.blockAt(new V(x,y,z)).boundingBox!=='empty'))continue;
for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const p=new V(x+dx,-37,z+dz),b=bot.blockAt(p);if(b&&b.boundingBox==='empty'&&[-36,-35].every(y=>bot.blockAt(new V(x+dx,y,z+dz)).boundingBox==='empty'))sites.push({stand:[x,z],gap:[x+dx,z+dz],below:bot.blockAt(p.offset(0,-1,0)).name});}
}return {sites,pos:bot.entity.position,hp:bot.health};

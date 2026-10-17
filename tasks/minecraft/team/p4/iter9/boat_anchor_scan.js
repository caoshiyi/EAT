const {Vec3}=require('vec3'),p=bot.entity.position.floored();
const cols=[];for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])for(let k=1;k<=4;k++){let x=p.x+dx*k,z=p.z+dz*k;cols.push({x,z,blocks:[55,56,57,58,59,60,61].map(y=>[y,bot.blockAt(new Vec3(x,y,z))?.name])})}
return{p:bot.entity.position,hp:bot.health,cols,enders:Object.values(bot.entities).filter(e=>e.name==='enderman'&&e.position.distanceTo(bot.entity.position)<80).map(e=>({id:e.id,p:e.position.clone(),d:e.position.distanceTo(bot.entity.position),angry:e.metadata?.[16],stared:e.metadata?.[17]})).sort((a,b)=>a.d-b.d).slice(0,6)};

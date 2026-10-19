const {Vec3}=require('vec3'),p=bot.entity.position.clone(),q=p.floored();
const wanted=['spruce_log','oak_log','birch_log','chest','crafting_table','sweet_berry_bush'];
const found=wanted.flatMap(n=>bot.findBlocks({matching:b=>b.name===n,maxDistance:30,count:5}).map(r=>({n,p:r,d:r.distanceTo(p),properties:bot.blockAt(r)?.getProperties()})));
const columns=[];for(let x=q.x-2;x<=q.x+2;x++)for(let z=q.z-2;z<=q.z+2;z++){let cells=[];for(let y=64;y<=Math.ceil(p.y);y++){const b=bot.blockAt(new Vec3(x,y,z));if(b&&b.name!=='air')cells.push([y,b.name]);}columns.push({x,z,cells});}
console.log('RESPAWN_SURVEY',JSON.stringify({at:new Date().toISOString(),p,hp:bot.health,food:bot.food,ground:bot.entity.onGround,time:bot.time.timeOfDay,found,columns,near:Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(p)<12).map(e=>({n:e.name,p:e.position.clone(),d:e.position.distanceTo(p)}))}));

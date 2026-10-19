// READONLY PROPOSAL. Only encounter_owner may execute this on P2 in the sandbox.
// No interaction and no interpretation of unobserved roof geometry.
if(bot.game.dimension!=='the_end'||bot.health<=0)throw Error('need actual living End source');
const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(new(bot.entity.position.constructor)(33.5,83,24.5))<.1);
if(!target)throw Error('actual target not loaded');
const root=target.position.floored(),cells=[];
for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const q=root.offset(dx,2,dz),b=bot.blockAt(q);cells.push({p:q,n:b?.name,shapes:b?.shapes});}
console.log('READONLY_ACTUAL_CAGE_ROOF',JSON.stringify({at:new Date().toISOString(),source:bot.entity.position.clone(),hp:bot.health,dimension:bot.game.dimension,target:{id:target.id,p:target.position.clone(),width:target.width,height:target.height},roof:cells}));

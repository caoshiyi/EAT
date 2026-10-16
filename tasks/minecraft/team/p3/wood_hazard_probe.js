// Concatenate into arena programs. Schema-tested, not a combat or LOS guarantee.
// Preconditions: entities from bot.entities, origin current Vec3, radius finite >=0.
// Output: nearby classified hazards including neutral mobs that can block/attack.
function p3Threats(entities, origin, radius){
 if(!origin||!Number.isFinite(radius)||radius<0)throw Error('invalid threat scan input');
 const names=new Set(['magma_cube','slime','ghast','blaze','wither_skeleton','skeleton','stray','spider','cave_spider','zombie','zombie_villager','husk','drowned','creeper','enderman','piglin','piglin_brute','zombified_piglin','hoglin','zoglin','witch','phantom','silverfish','endermite','guardian','elder_guardian','shulker','ravager','vindicator','evoker','pillager','vex','warden']);
 return Object.values(entities).filter(e=>e?.position&&e.type!=='player'&&(e.type==='hostile'||String(e.kind||'').toLowerCase().includes('hostile')||names.has(e.name))).map(e=>({id:e.id,name:e.name,type:e.type,kind:e.kind,distance:Math.hypot(e.position.x-origin.x,e.position.y-origin.y,e.position.z-origin.z),position:{x:e.position.x,y:e.position.y,z:e.position.z}})).filter(e=>e.distance<=radius).sort((a,b)=>a.distance-b.distance);
}

const{Vec3}=require('vec3'); console.log('TIME',bot.time.timeOfDay,'CAMP',p3Threats(bot.entities,bot.entity.position,24),'TREE',p3Threats(bot.entities,new Vec3(11,66,112),24));

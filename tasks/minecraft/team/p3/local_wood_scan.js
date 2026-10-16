// Read-only surface target selection, not a navigation/path guarantee.
function observedFeet(x,z,preferredY){
 const {Vec3}=require('vec3');const hazards=new Set(['water','lava','fire','soul_fire','magma_block','cactus','sweet_berry_bush','cobweb','nether_portal','ice']);
 const pass=b=>b&&b.boundingBox==='empty'&&!hazards.has(b.name);
 const full=b=>b&&!hazards.has(b.name)&&b.shapes.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);
 for(const dy of[0,1,-1,2,-2]){const y=preferredY+dy,q=new Vec3(x,y,z),f=bot.blockAt(q.offset(0,-1,0));if(full(f)&&pass(bot.blockAt(q))&&pass(bot.blockAt(q.offset(0,1,0))))return{x,y,z,floor:f.name,feet:bot.blockAt(q).name};}
 return null;
}
// Concatenate into arena programs. Schema-tested, not a combat or LOS guarantee.
// Preconditions: entities from bot.entities, origin current Vec3, radius finite >=0.
// Output: nearby classified hazards including neutral mobs that can block/attack.
function p3Threats(entities, origin, radius){
 if(!origin||!Number.isFinite(radius)||radius<0)throw Error('invalid threat scan input');
 const names=new Set(['magma_cube','slime','ghast','blaze','wither_skeleton','skeleton','stray','spider','cave_spider','zombie','zombie_villager','husk','drowned','creeper','enderman','piglin','piglin_brute','zombified_piglin','hoglin','zoglin','witch','phantom','silverfish','endermite','guardian','elder_guardian','shulker','ravager','vindicator','evoker','pillager','vex','warden']);
 return Object.values(entities).filter(e=>e?.position&&e.type!=='player'&&(e.type==='hostile'||String(e.kind||'').toLowerCase().includes('hostile')||names.has(e.name))).map(e=>({id:e.id,name:e.name,type:e.type,kind:e.kind,distance:Math.hypot(e.position.x-origin.x,e.position.y-origin.y,e.position.z-origin.z),position:{x:e.position.x,y:e.position.y,z:e.position.z}})).filter(e=>e.distance<=radius).sort((a,b)=>a.distance-b.distance);
}

const{Vec3}=require('vec3');for(const [x,z,y] of [[33,80,69],[34,94,68],[29,99,69],[27,94,72]]){console.log('TREE',x,z,bot.blockAt(new Vec3(x,y,z)).name,'FOES',p3Threats(bot.entities,new Vec3(x,y,z),32));for(const[dx,dz]of[[-1,0],[0,-1],[1,0],[0,1],[-2,0],[0,-2],[2,0],[0,2]])for(const py of[63,66,69,72]){const q=observedFeet(x+dx,z+dz,py);if(q)console.log('FEET',q);}}

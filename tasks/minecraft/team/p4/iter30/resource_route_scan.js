const {Vec3}=require('vec3'),p=bot.entity.position.clone();
const groups=[['rock',['stone','cobblestone','blackstone','cobbled_deepslate'],14,14],['snow',['snow'],12,12],['portal',['nether_portal','end_portal'],128,12]];
const out={at:new Date().toISOString(),p,hp:bot.health,food:bot.food};
for(const [label,names,radius,count]of groups)out[label]=bot.findBlocks({matching:b=>names.includes(b.name),maxDistance:radius,count}).map(q=>({p:q,n:bot.blockAt(q)?.name,d:q.distanceTo(p)}));
console.log('ACTUAL_RESOURCE_ROUTE_SCAN',JSON.stringify(out));

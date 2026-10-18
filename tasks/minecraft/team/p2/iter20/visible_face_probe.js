// Fresh iteration20 read-only camera tool. No hit/use/dig/place/network/packets.
// Find an actual first-hit face with ordinary camera aim before any interaction.
const {Vec3}=require('vec3');
async function visibleFace(p, face, budgetMs=1800) {
  const normals=[new Vec3(0,-1,0),new Vec3(0,1,0),new Vec3(0,0,-1),new Vec3(0,0,1),new Vec3(-1,0,0),new Vec3(1,0,0)], n=normals[face], start=Date.now(),trials=[];
  if(!n)throw Error('invalid face');
  for(const [a,b] of [[.35,.65],[.65,.35],[.25,.25],[.75,.75],[.35,.35],[.65,.65]]) {
    if(Date.now()-start>budgetMs)break;
    const local=n.y?new Vec3(a,n.y>0?1:0,b):n.z?new Vec3(a,b,n.z>0?1:0):new Vec3(n.x>0?1:0,a,b);
    const aim=p.plus(local).minus(n.scaled(.015)); // inside surface, never behind a nearer block
    await bot.lookAt(aim,true); await bot.waitForTicks(2);
    const hit=bot.blockAtCursor(4.5), entry=hit&&{p:hit.position,face:hit.face,intersect:hit.intersect};trials.push({aim,hit:entry});
    if(hit&&hit.position.equals(p)&&hit.face===face&&hit.intersect&&[1.62,1.8].every(h=>bot.entity.position.offset(0,h,0).distanceTo(hit.intersect)<=4.5))
      return{qualified:true,p,face,aim,intersect:hit.intersect,dist162:bot.entity.position.offset(0,1.62,0).distanceTo(hit.intersect),dist180:bot.entity.position.offset(0,1.8,0).distanceTo(hit.intersect),trials};
  }
  return{qualified:false,p,face,trials};
}
const tests=[];
for(const [p,face] of [[new Vec3(138,-37,2231),1],[new Vec3(139,-35,2232),2],[new Vec3(139,-36,2233),2]])tests.push(await visibleFace(p,face));
return{tests:tests.map(t=>({...t,targetName:bot.blockAt(t.p)?.name})),p:bot.entity.position,hp:bot.health,inventory:bot.inventory.items().map(i=>[i.name,i.count]),note:'Camera qualification only; no interaction performed or assumed.'};

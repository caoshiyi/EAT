function p2LandingThreats(bot,foot,removed=[]){
 const key=q=>q.toArray().join(','),virtual=new Set(removed.map(key)),foes=new Set(['skeleton','stray','zombie','creeper','spider','cave_spider','witch','pillager','vindicator','silverfish','enderman','zombie_villager']);
 const rays=[];for(const e of Object.values(bot.entities)){if(!foes.has(e.name)||(e.metadata?.[9]??1)<=0||e.position.distanceTo(foot)>24)continue;for(const y of[.2,.9,1.5])for(const[x,z]of[[0,0],[.25,.25],[-.25,-.25],[.25,-.25],[-.25,.25]]){
  const a=e.position.offset(0,(e.height||1.8)*.85,0),b=foot.offset(x,y,z),d=b.minus(a),n=Math.ceil(d.norm()/.1);let wall=null,unknown=null;
  for(let k=1;k<n;k++){const p=a.plus(d.scaled(k/n)).floored();if(virtual.has(key(p)))continue;const block=bot.blockAt(p);if(!block){unknown=p.toArray();break;}if(block.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')){wall=p.toArray();break;}}
  if(!wall)rays.push({foe:e.id,name:e.name,p:e.position.toArray(),target:b.toArray(),unknown});
 }}return rays;
}


const{Vec3}=require('vec3');bot.clearControlStates();bot.pathfinder.setGoal(null);const p=bot.entity.position.clone(),q=p.floored(),full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');return{at:new Date().toISOString(),world:bot.game.dimension,lifeId:bot.entity.id,p,hp:bot.health,food:bot.food,ground:bot.entity.onGround,floor:full(q.offset(0,-1,0)),roof:full(q.offset(0,2,0)),sideBlocks:[[1,0],[-1,0],[0,1],[0,-1]].map(([x,z])=>[x,z,...[0,1].map(y=>bot.blockAt(q.offset(x,y,z))?.name)]),foeRays:p2LandingThreats(bot,p),nearPeers:Object.values(bot.entities).filter(e=>e.username&&e.id!==bot.entity.id).map(e=>[e.username,e.position.clone()]),inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),controls:bot.controlState,cursor:bot.inventory.selectedItem,goal:bot.pathfinder.goal};
async function arena(bot, Movements, goals) {
function p2LandingThreats(bot,foot,removed=[]){
 const key=q=>q.toArray().join(','),virtual=new Set(removed.map(key)),foes=new Set(['skeleton','stray','zombie','creeper','spider','cave_spider','witch','pillager','vindicator','silverfish','enderman','zombie_villager']);
 const rays=[];for(const e of Object.values(bot.entities)){if(!foes.has(e.name)||(e.metadata?.[9]??1)<=0||e.position.distanceTo(foot)>24)continue;for(const y of[.2,.9,1.5])for(const[x,z]of[[0,0],[.25,.25],[-.25,-.25],[.25,-.25],[-.25,.25]]){
  const a=e.position.offset(0,(e.height||1.8)*.85,0),b=foot.offset(x,y,z),d=b.minus(a),n=Math.ceil(d.norm()/.1);let wall=null,unknown=null;
  for(let k=1;k<n;k++){const p=a.plus(d.scaled(k/n)).floored();if(virtual.has(key(p)))continue;const block=bot.blockAt(p);if(!block){unknown=p.toArray();break;}if(block.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')){wall=p.toArray();break;}}
  if(!wall)rays.push({foe:e.id,name:e.name,p:e.position.toArray(),target:b.toArray(),unknown});
 }}return rays;
}
bot.clearControlStates();bot.pathfinder.setGoal(null);
const p=bot.entity.position.floored();
const visibleRays=p2LandingThreats(bot,bot.entity.position);
return {visibleRays,p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,onGround:bot.entity.onGround,velocity:bot.entity.velocity,controls:bot.controlState,goal:bot.pathfinder.goal??null,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),local:[[0,-1,0],[0,0,0],[0,1,0],[0,2,0]].map(a=>{const q=p.offset(...a),b=bot.blockAt(q);return [q.toArray(),b?.name,b?.shapes];}),near:Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(bot.entity.position)<18).map(e=>[e.name,e.position])};

}
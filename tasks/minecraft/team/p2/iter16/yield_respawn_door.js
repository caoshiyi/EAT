function p2LandingThreats(bot,foot,removed=[]){
 const key=q=>q.toArray().join(','),virtual=new Set(removed.map(key)),foes=new Set(['skeleton','stray','zombie','creeper','spider','cave_spider','witch','pillager','vindicator','silverfish','enderman','zombie_villager']);
 const rays=[];for(const e of Object.values(bot.entities)){if(!foes.has(e.name)||(e.metadata?.[9]??1)<=0||e.position.distanceTo(foot)>24)continue;for(const y of[.2,.9,1.5])for(const[x,z]of[[0,0],[.25,.25],[-.25,-.25],[.25,-.25],[-.25,.25]]){
  const a=e.position.offset(0,(e.height||1.8)*.85,0),b=foot.offset(x,y,z),d=b.minus(a),n=Math.ceil(d.norm()/.1);let wall=null,unknown=null;
  for(let k=1;k<n;k++){const p=a.plus(d.scaled(k/n)).floored();if(virtual.has(key(p)))continue;const block=bot.blockAt(p);if(!block){unknown=p.toArray();break;}if(block.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')){wall=p.toArray();break;}}
  if(!wall)rays.push({foe:e.id,name:e.name,p:e.position.toArray(),target:b.toArray(),unknown});
 }}return rays;
}

const {Vec3}=require('vec3'),hp=bot.health,self=bot.entity,start=Date.now();let issue=null;const trace=[];bot.clearControlStates();bot.pathfinder.setGoal(null);
try{for(const a of[[146,-36,2243]]){const q=new Vec3(...a);if(!['air','cave_air'].includes(bot.blockAt(q)?.name)||!['air','cave_air'].includes(bot.blockAt(q.offset(0,1,0))?.name)||!bot.blockAt(q.offset(0,-1,0))?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')||p2LandingThreats(bot,q.offset(.5,0,.5)).length)throw Error('LOCAL_ROUTE');for(let n=0;n<40;n++){if(bot.entity!==self||bot.health<hp||bot.game.dimension!=='overworld'||Date.now()-start>9000)throw Error('BODY_TIME');let t=q.offset(.5,0,.5),dist=self.position.distanceTo(t);if(dist<.1&&self.onGround)break;await bot.lookAt(t.offset(0,1.4,0),true);bot.setControlState('forward',true);bot.setControlState('sneak',dist<.4);await bot.waitForTicks(1)}bot.clearControlStates();if(self.position.distanceTo(q.offset(.5,0,.5))>.15)throw Error('MOVE_ACK');trace.push(q.toArray());}}catch(e){issue=e.message}finally{bot.clearControlStates();bot.pathfinder.setGoal(null)}
const p=self.position.floored();return{issue,trace,p:self.position,hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),floor:bot.blockAt(p.offset(0,-1,0))?.name,roof:bot.blockAt(p.offset(0,2,0))?.name,visibleRays:p2LandingThreats(bot,self.position),controls:bot.controlState};

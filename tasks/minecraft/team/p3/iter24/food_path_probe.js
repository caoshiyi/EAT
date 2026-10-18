const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;bot.pathfinder.setMovements(m);
const ps=bot.findBlocks({matching:bot.registry.blocksByName.sweet_berry_bush.id,maxDistance:128,count:40});
console.log('BERRIES',JSON.stringify(ps.map(p=>({p,props:bot.blockAt(p)?.getProperties(),d:p.distanceTo(bot.entity.position)}))));
for(const target of [{x:10,y:73,z:108},{x:33,y:73,z:80},...ps.slice(0,3)]) {const g=new goals.GoalNear(target.x,target.y,target.z,2);const path=bot.pathfinder.getPathTo(m,g,1000);console.log('MODEL',target,path.status,path.path?.length,path.path?.slice(0,5));}

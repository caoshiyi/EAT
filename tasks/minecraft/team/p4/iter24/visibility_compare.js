bot.clearControlStates();bot.pathfinder.setGoal(null);
const p=bot.entity.position.clone(),base=p.floored(),out=[];
if(bot.health!==20||base.x!==-9||base.y!==26||base.z!==-38)throw Error('body');
const offsets=[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.99],[.5,.5,.01]];
for(const d of [[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]]){
 const pos=base.offset(...d),b=bot.blockAt(pos);if(!b)throw Error('unloaded');
 const seen=bot.canSeeBlock(b),hits=[];
 for(const o of offsets){await bot.lookAt(pos.offset(...o),true);const c=bot.blockAtCursor(4.5);if(c?.position.equals(pos)&&c.intersect){const dist=bot.entity.position.offset(0,bot.entity.eyeHeight,0).distanceTo(c.intersect);if(dist<=4.5)hits.push({aim:o,face:c.face,hit:c.intersect,distance:dist});}}
 out.push({pos,name:b.name,canSeeBlock:seen,hits});
}
console.log(JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,eye:bot.entity.eyeHeight,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),out}));

bot.clearControlStates();bot.pathfinder.setGoal(null);
const V=bot.entity.position.constructor,W=new V(-9,26,-38),E=W.offset(1,0,0),target=new V(-7,27,-38),src=W.offset(0,-1,0);
if(bot.game.dimension!=='overworld'||bot.health!==20||!bot.entity.position.floored().equals(W))throw Error('freshstart');
const cells=[src,src.offset(0,-1,0),target,...[[1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(d=>target.offset(...d)),...[[1,0,0],[-1,0,0],[0,-1,0],[0,0,1],[0,0,-1]].map(d=>src.offset(...d))].map(p=>({p,n:bot.blockAt(p)?.name,full:bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')}));
console.log(JSON.stringify({env:'SANDBOX_G25-1',at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),cells}));

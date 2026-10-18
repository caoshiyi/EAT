bot.clearControlStates();bot.pathfinder.setGoal(null);const V=bot.entity.position.constructor,W=new V(-9,26,-38),ps=[];
if(bot.game.dimension!=='overworld'||bot.health!==20||!bot.entity.position.floored().equals(W))throw Error('freshstart');
for(let x=-12;x<=-7;x++)for(let z=-39;z<=-37;z++)for(let y=25;y<=29;y++){const p=new V(x,y,z),b=bot.blockAt(p);ps.push({p,n:b?.name,sh:b?.shapes});}
console.log(JSON.stringify({env:'SANDBOX_G25-4',at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),cells:ps,near:Object.values(bot.entities).filter(e=>e!==bot.entity&&e.position.distanceTo(bot.entity.position)<16).map(e=>({n:e.name,p:e.position}))}));

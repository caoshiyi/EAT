const V=bot.entity.position.constructor;bot.pathfinder.setGoal(null);bot.clearControlStates();bot.stopDigging();const hp=bot.health,dim=bot.game.dimension;
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.maxDropDown=1;bot.pathfinder.setMovements(m);
const result=bot.pathfinder.getPathTo(m,new goals.GoalBlock(7,63,-10),2000);console.log('RECONCILE_PATH',JSON.stringify({p:bot.entity.position,hp,dim,inv:bot.inventory.items().map(i=>[i.name,i.count]),status:result.status,path:result.path.map(q=>[q.x,q.y,q.z,q.toBreak.length,q.toPlace.length])}));
try{
 if(dim!=='overworld'||hp!==20||result.status!=='success'||result.path.length>45||result.path.some(q=>q.toBreak.length||q.toPlace.length))throw Error('no qualified surface path');
 for(const n of result.path){const before=bot.entity.position.clone(),target=new V(n.x,n.y,n.z);if(before.distanceTo(target)>2.1)throw Error('path leg too large');let done=false,error=null;
 const task=bot.pathfinder.goto(new goals.GoalBlock(Math.floor(n.x),n.y,Math.floor(n.z))).then(()=>{done=true},e=>{done=true;error=e});const start=Date.now();
 try{while(!done){const p=bot.entity.position;if(bot.game.dimension!==dim||bot.health<hp||Date.now()-start>3500||p.y<Math.min(before.y,n.y)-.6||p.y>Math.max(before.y,n.y)+1.5||p.distanceTo(before)>3.2)throw Error('leg life/time/envelope');await bot.waitForTicks(1);}if(error)throw error;}
 finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
 await bot.waitForTicks(14);const p=bot.entity.position;if(bot.game.dimension!==dim||bot.health<hp||!bot.entity.onGround||Math.abs(p.y-n.y)>.2||Math.hypot(p.x-n.x,p.z-n.z)>.8)throw Error('leg physical failed');console.log('LEG',JSON.stringify({p,hp:bot.health,target}));
 }
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),goal:bot.pathfinder.goal,controls:bot.controlState,foes:Object.values(bot.entities).filter(e=>e.type==='mob'&&e.position.distanceTo(bot.entity.position)<20).map(e=>({n:e.name,p:e.position}))}));}

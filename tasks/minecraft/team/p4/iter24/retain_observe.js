// Current closed TWO-cell room after10767. Read-only postconditions, no local10-face claim.
bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(5);
const V=bot.entity.position.constructor,w=new V(-9,26,-38),e=w.offset(1,0,0);
const ps=[w.offset(0,-1,0),e.offset(0,-1,0),w.offset(0,2,0),e.offset(0,2,0),w.offset(-1,0,0),w.offset(-1,1,0),e.offset(1,0,0),e.offset(1,1,0),...[-1,1].flatMap(z=>[w.offset(0,0,z),w.offset(0,1,z),e.offset(0,0,z),e.offset(0,1,z)])];
for(let sample=0;sample<3;sample++){
 const cells=ps.map(p=>({p,name:bot.blockAt(p)?.name,full:!!bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')}));
 console.log(JSON.stringify({sample,at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,eye:bot.entity.eyeHeight,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),goal:!!bot.pathfinder.goal,inv:bot.inventory.items().map(i=>[i.name,i.count]),cells,bodyCells:[w,w.offset(0,1,0),e,e.offset(0,1,0)].map(p=>({p,n:bot.blockAt(p)?.name})),entities:Object.values(bot.entities).filter(a=>a!==bot.entity&&a.position.distanceTo(bot.entity.position)<12).map(a=>[a.name,a.position])}));
 await bot.waitForTicks(5);
}

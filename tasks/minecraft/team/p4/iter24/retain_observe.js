bot.pathfinder.setGoal(null);bot.clearControlStates();
for(let sample=0;sample<3;sample++){
 const base=bot.entity.position.floored();
 const faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>{const p=base.offset(...d),b=bot.blockAt(p);return{p,name:b?.name,loaded:!!b,full:!!b?.shapes?.some(s=>s.length===6&&s.every((v,i)=>v===[0,0,0,1,1,1][i]))};});
 console.log(JSON.stringify({sample,at:new Date().toISOString(),p:bot.entity.position,dimension:bot.game.dimension,health:bot.health,food:bot.food,ground:bot.entity.onGround,controls:bot.controlState,goal:!!bot.pathfinder.goal,inv:bot.inventory.items().map(i=>[i.name,i.count]),faces,entities:Object.values(bot.entities).filter(e=>e!==bot.entity&&e.position.distanceTo(bot.entity.position)<12).map(e=>({name:e.name,p:e.position}))}));
 await bot.waitForTicks(5);
}

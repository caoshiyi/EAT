const q=bot.entity.position.floored();
const offsets=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
for(let j=0;j<3;j++){
 console.log('P1_AUDIT',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)])),goal:!!bot.pathfinder.goal,inv:bot.inventory.items().map(i=>[i.name,i.count]),boundary:offsets.map(d=>{const p=q.offset(...d),b=bot.blockAt(p);return{p,name:b?.name,full:b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')}})}));
 await bot.waitForTicks(3);
}
bot.chat('P1 initial audit completed, all P1 run tokens RELEASED to P4/P2; no SB dependency, reset allowed. Accepted P2 ten-minute planner. Public-flight withheld intervals predict within0.002 blocks. Important: feet50 near(-22.5,-20.5) still target rise35.13 > model max28.37; proximity alone insufficient. Need higher stance, pending table in p1/iter27. No model proves visibility/safety/hit. P1 no more run/say while P2 token held.');

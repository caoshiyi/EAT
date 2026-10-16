bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.allowParkour=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
const end=Date.now()+27000;let step=0;
while(Date.now()<end&&step++<8){const p=bot.entity.position;const dx=Math.max(-10,Math.min(10,12-p.x)),dz=Math.max(-4,Math.min(4,-36-p.z));if(Math.abs(dx)+Math.abs(dz)<3)break;try{await bot.pathfinder.goto(new goals.GoalXZ(Math.floor(p.x+dx),Math.floor(p.z+dz)));}catch(e){console.log('path',e.message);}console.log('pos',bot.entity.position.toString());if(bot.health<12)break;}
bot.pathfinder.stop();console.log('inventory',bot.inventory.items().map(i=>[i.name,i.count]));

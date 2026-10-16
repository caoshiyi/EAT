bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.allowParkour=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1000;
const start=bot.entity.position.clone();
for(let k=1;k<=3;k++){
 const t=start.offset(-12*k,0,0);try{await bot.pathfinder.goto(new goals.GoalNear(t.x,t.y,t.z,3));}catch(e){console.log('path',e.message);break;}
 console.log('step',bot.entity.position.toString());
 const mobs=Object.values(bot.entities).filter(e=>['cow','pig','sheep','chicken'].includes(e.name)).map(e=>({name:e.name,pos:e.position.toString()}));console.log('food mobs',mobs);if(mobs.length)break;
}
console.log('final',bot.entity.position.toString(),'health',bot.health,'food',bot.food);

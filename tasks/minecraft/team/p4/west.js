bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.allowParkour=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
for(let k=0;k<4;k++){
const x=bot.entity.position.x-8,z=bot.entity.position.z;
try{await bot.pathfinder.goto(new goals.GoalXZ(Math.floor(x),Math.floor(z)));}catch(e){console.log('path',e.message);}
console.log('position',bot.entity.position.toString());
const mobs=Object.values(bot.entities).filter(e=>['cow','pig','sheep','chicken'].includes(e.name)).map(e=>({name:e.name,pos:e.position.toString()}));console.log('mobs',mobs);if(mobs.length)break;
}
console.log('lava',bot.findBlocks({matching:bot.registry.blocksByName.lava.id,maxDistance:48,count:5}).map(p=>p.toString()));

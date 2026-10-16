bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.maxDropDown=1;m.allowParkour=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1600;
for(let i=0;i<4;i++){
const p=bot.entity.position;const x=Math.min(-1,p.x+8),z=Math.min(-43,p.z+3),y=Math.max(66,Math.floor(p.y));
try{await bot.pathfinder.goto(new goals.GoalNear(x,y,z,1));}catch(e){console.log('path',e.message);bot.pathfinder.stop();}
console.log('position',bot.entity.position.toString());if(bot.entity.position.distanceTo(new (require('vec3').Vec3)(-1,66,-43))<5)break;
}
bot.pathfinder.stop();

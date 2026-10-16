bot.pathfinder.stop();const m=new Movements(bot);m.canDig=true;m.allowParkour=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1500;
bot.chat('GoalXZ 8-block local legs worked descending canopy to west. Chickens west (-79,65,-59), sheep (-86,68,-46). p4 hunting west; east sheep (73,74,-34) for p1.');
const end=Date.now()+26000;
for(let i=0;i<7&&Date.now()<end;i++){
 const p=bot.entity.position;try{await bot.pathfinder.goto(new goals.GoalXZ(Math.floor(p.x)-10,Math.floor(p.z)-2));}catch(e){console.log('path',e.message);}
 console.log('position',bot.entity.position.toString());
 const mob=Object.values(bot.entities).filter(e=>['chicken','sheep','pig','cow'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<14).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];
 if(mob){console.log('target',mob.name,mob.position.toString());global.p4target=mob.id;break;}
 if(bot.health<14)break;
}
bot.pathfinder.stop();console.log('health',bot.health,'food',bot.food);

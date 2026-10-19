const V=bot.entity.position.constructor;console.log('SOURCE',bot.entity.position,bot.health,bot.food);if(bot.entity.position.distanceTo(new V(6.5,67,82.5))>.3)throw Error('not home');
console.log('DOOR',[67,68].map(y=>bot.blockAt(new V(5,y,82)).name));if([67,68].some(y=>bot.blockAt(new V(5,y,82)).boundingBox==='block'))throw Error('door blocked');
await bot.lookAt(new V(2.5,68.62,82.5),true);bot.setControlState('forward',true);await bot.waitForTicks(27);bot.clearControlStates();await bot.waitForTicks(8);console.log('DESCENT',bot.entity.position,bot.health);
const m=new Movements(bot);m.canDig=true;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.maxDropDown=3;m.scafoldingBlocks=[];m.entitiesToAvoid=new Set(['creeper','zombie','skeleton','witch','spider']);bot.pathfinder.setMovements(m);
const upd=r=>console.log('PATH',r.status,r.path?.length);bot.on('path_update',upd);let reason='budget',last=bot.entity.position.clone(),lastDist=1e9,stall=0;
bot.pathfinder.setGoal(new goals.GoalNear(19,67,111,2));
try{for(let k=0;k<600;k++){await bot.waitForTicks(1);if(k%40===0){const p=bot.entity.position,d=p.distanceTo(new V(19.5,67,111.5));console.log('MOVE',k,p,bot.health,bot.food,d);if(d>lastDist-.5)stall++;else stall=0;lastDist=d;if(stall>=3){reason='net_stall';break;}}
 if(bot.health<16){reason='hurt';break;}if(bot.entity.position.distanceTo(new V(19.5,67,111.5))<3&&bot.entity.onGround){reason='tree';break;}}
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('path_update',upd);}
console.log('END',reason,bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));

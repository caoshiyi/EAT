const V=bot.entity.position.constructor;const src=bot.entity.position.clone(),hp=bot.health;
console.log('SOURCE',new Date().toISOString(),src,hp,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));if(src.distanceTo(new V(6.5,67,82.5))>.3||hp<19)throw Error('source mismatch');
for(const [a,n]of[[[5,68,82],'sand'],[[5,67,82],'dirt']]){const b=bot.blockAt(new V(...a));if(b.name!==n)throw Error('door mismatch');await bot.dig(b);await bot.waitForTicks(15);}
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.maxDropDown=4;m.scafoldingBlocks=[];m.entitiesToAvoid=new Set(['creeper','zombie','skeleton','witch','spider']);bot.pathfinder.setMovements(m);
let reason='budget';bot.pathfinder.setGoal(new goals.GoalNear(19,67,111,2));
try{for(let k=0;k<500;k++){await bot.waitForTicks(1);if(k%40===0)console.log('TRAVEL',k,bot.entity.position,bot.health,bot.food,bot.pathfinder.isMoving());if(bot.health<hp-3){reason='hurt';break;}if(bot.entity.position.distanceTo(new V(19.5,67,111.5))<3&&bot.entity.onGround){reason='tree';break;}}
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
console.log('END',reason,bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));console.log('NEAR',Object.values(bot.entities).filter(e=>e!==bot.entity&&e.position.distanceTo(bot.entity.position)<8).map(e=>[e.name,e.position]));console.log('TREE',[67,68,69].map(y=>[y,bot.blockAt(new V(19,y,111))?.name]));

const V=bot.entity.position.constructor;
const movement=new Movements(bot);movement.canDig=false;movement.allow1by1towers=false;movement.allowParkour=false;movement.allowSprinting=false;movement.scafoldingBlocks=[];movement.maxDropDown=3;bot.pathfinder.setMovements(movement);
async function goChecked(x,y,z,ms=12000){
 const before={p:bot.entity.position.clone(),hp:bot.health,dim:bot.game.dimension}; let timer;
 try{await Promise.race([bot.pathfinder.goto(new goals.GoalBlock(x,y,z)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('movement timeout')),ms)})]);}
 finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 for(let n=0;n<20&&!bot.entity.onGround;n++)await bot.waitForTicks(1);
 const p=bot.entity.position;
 const ok=bot.game.dimension===before.dim&&bot.health>0&&bot.health>=before.hp&&bot.entity.onGround&&(Math.abs(p.y-y)<=.12 || (x===140&&z===2239&&Math.abs(p.y-y-.5)<.1))&&Math.hypot(p.x-x-.5,p.z-z-.5)<=.8;
 console.log('CHECKED_LEG',JSON.stringify({target:[x,y,z],before,p,hp:bot.health,ground:bot.entity.onGround,goal:bot.pathfinder.goal,controls:bot.controlState,ok}));if(!ok)throw Error('physical postcondition failed');
}

function state(){return {p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState,goal:bot.pathfinder.goal};}
async function enter(x,z){const end=Date.now()+4000;try{while(bot.game.dimension==='overworld'&&Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.07){if(Date.now()>end)throw Error('entry budget');await bot.lookAt(new V(x,bot.entity.position.y+1.62,z),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}finally{bot.clearControlStates();}}
try{
 console.log('START',JSON.stringify(state()));if(bot.game.dimension!=='overworld'||bot.health!==20||!bot.inventory.items().some(i=>i.name==='white_bed'))throw Error('not actual courier state');
 for(const a of [[138,-38,2233],[138,-37,2232],[138,-36,2231],[140,-35,2232],[140,-36,2239],[139,-36,2239],[139,-36,2255],[131,-36,2255],[130,-36,2256],[130,-36,2265],[128,-36,2266],[128,-36,2272],[131,-36,2272],[131,-36,2275]])await goChecked(...a);
 await enter(132.5,2275.5);await enter(133.5,2275.5);for(let n=0;n<130&&bot.game.dimension==='overworld';n++)await bot.waitForTicks(1);
 if(bot.game.dimension!=='the_end')throw Error('no End transition');console.log('ACTUAL_END_ARRIVAL',JSON.stringify(state()));
 if(bot.blockAt(new V(97,49,0))?.boundingBox!=='block')throw Error('no97step');
 await goChecked(97,50,0,7000);await goChecked(79,50,0,10000);
 if([50,51].some(y=>bot.blockAt(new V(78,y,0)).boundingBox!=='empty'))throw Error('door changed stop');
 await goChecked(75,50,0,5000);console.log('RETAINED_BED_END75',JSON.stringify(state()));
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify(state()));}

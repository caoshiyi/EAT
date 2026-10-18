const V=bot.entity.position.constructor;
const movement=new Movements(bot);movement.canDig=false;movement.allow1by1towers=false;movement.allowParkour=false;movement.allowSprinting=false;movement.scafoldingBlocks=[];movement.maxDropDown=1;bot.pathfinder.setMovements(movement);
async function goChecked(x,y,z,ms=4000){
 const before={p:bot.entity.position.clone(),hp:bot.health,dim:bot.game.dimension}; let timer;
 try{await Promise.race([bot.pathfinder.goto(new goals.GoalBlock(x,y,z)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('movement timeout')),ms)})]);}
 finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 for(let n=0;n<20&&!bot.entity.onGround;n++)await bot.waitForTicks(1);
 const p=bot.entity.position;
 const ok=bot.game.dimension===before.dim&&bot.health>0&&bot.health>=before.hp&&bot.entity.onGround&&Math.abs(p.y-y)<=.12&&Math.hypot(p.x-x-.5,p.z-z-.5)<=.8;
 console.log('CHECKED_LEG',JSON.stringify({target:[x,y,z],before,p,hp:bot.health,ground:bot.entity.onGround,goal:bot.pathfinder.goal,controls:bot.controlState,ok}));if(!ok)throw Error('physical postcondition failed');
}

function state(){const p=bot.entity.position;return {p,hp:bot.health,food:bot.food,ground:bot.entity.onGround,dim:bot.game.dimension,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState,goal:bot.pathfinder.goal};}
let traversed=[];
try{
 for(const a of [[136,-38,2233],[137,-38,2233],[138,-38,2233],[138,-37,2232],[138,-36,2231],[139,-36,2231],[140,-36,2231],[141,-36,2231],[142,-36,2231],[143,-36,2231],[144,-35,2231],[145,-34,2231]]){await goChecked(...a);traversed.push(a);}
 console.log('UPPER_SOURCE',JSON.stringify({state:state(),grid:[[144,-32,2230],[147,-32,2230],[148,-35,2231],[147,-34,2231]].map(a=>{const p=new V(...a),b=bot.blockAt(p);return {p,n:b?.name,shapes:b?.shapes}}),foes:Object.values(bot.entities).filter(e=>e.type==='mob'&&e.position.distanceTo(bot.entity.position)<12).map(e=>({id:e.id,n:e.name,p:e.position}))}));
}finally{
 for(const a of traversed.slice(0,-1).reverse()){try{await goChecked(...a);}catch(e){console.log('RETREATFAIL',String(e));break;}}
 try{if(bot.game.dimension==='overworld'&&bot.health===20)await goChecked(135,-38,2233);}catch(e){console.log(String(e));}
 bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify(state()));
}

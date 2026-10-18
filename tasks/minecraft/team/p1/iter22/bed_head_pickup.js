const V=bot.entity.position.constructor;
const movement=new Movements(bot);movement.canDig=false;movement.allow1by1towers=false;movement.allowParkour=false;movement.allowSprinting=false;movement.scafoldingBlocks=[];movement.maxDropDown=3;bot.pathfinder.setMovements(movement);
async function goChecked(x,y,z,ms=4000){
 const before={p:bot.entity.position.clone(),hp:bot.health,dim:bot.game.dimension}; let timer;
 try{await Promise.race([bot.pathfinder.goto(new goals.GoalBlock(x,y,z)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('movement timeout')),ms)})]);}
 finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 for(let n=0;n<20&&!bot.entity.onGround;n++)await bot.waitForTicks(1);
 const p=bot.entity.position;
 const ok=bot.game.dimension===before.dim&&bot.health>0&&bot.health>=before.hp&&bot.entity.onGround&&Math.abs(p.y-y)<=.12&&Math.hypot(p.x-x-.5,p.z-z-.5)<=.8;
 console.log('CHECKED_LEG',JSON.stringify({target:[x,y,z],before,p,hp:bot.health,ground:bot.entity.onGround,goal:bot.pathfinder.goal,controls:bot.controlState,ok}));if(!ok)throw Error('physical postcondition failed');
}

const out=[[136,-38,2233],[137,-38,2233],[138,-38,2233],[138,-37,2232],[138,-36,2231],[139,-36,2231],[140,-36,2231],[141,-36,2231]];
function state(){return {p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),goal:bot.pathfinder.goal,controls:bot.controlState};}
try{
 if(bot.game.dimension!=='overworld'||bot.health!==20||bot.inventory.items().length)throw Error('changed opening');
 for(const a of out)await goChecked(...a);
 const drop=Object.values(bot.entities).find(e=>e.name==='item'&&bot.registry.items[e.metadata?.[8]?.itemId]?.name==='white_bed');
 if(!drop)throw Error('fresh bed drop absent');console.log('CHANGED_HEAD_PICKUP',JSON.stringify({id:drop.id,p:drop.position}));
 if(drop.position.distanceTo(new V(142.73,-36,2233.8))>1)throw Error('bed moved elsewhere');
 if(bot.blockAt(new V(142,-37,2233)).boundingBox!=='block')throw Error('no headpickup floor');
 await goChecked(142,-36,2231);await goChecked(142,-36,2232);await goChecked(142,-36,2233);await bot.waitForTicks(12);
 console.log('BED_RECEIPT',JSON.stringify(state()));if(!bot.inventory.items().some(i=>i.name==='white_bed'&&i.count===1))throw Error('no ordinary bed receipt');
 await goChecked(142,-36,2231);await goChecked(141,-36,2231);
}finally{
 for(const a of out.slice(0,-1).reverse()){try{await goChecked(...a);}catch(e){console.log('RETREAT_FAIL',String(e));break;}}
 try{await goChecked(135,-38,2233);}catch(e){console.log(String(e));}bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify(state()));
}

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
try{for(const a of out)await goChecked(...a);for(const a of [[142,-36,2232],[142,-36,2233]]){const p=new V(...a),b=bot.blockAt(p);await bot.lookAt(p.offset(.5,.3,.5),true);console.log('BED_CURRENT',JSON.stringify({p,n:b.name,props:b.getProperties(),cursor:bot.blockAtCursor(4.5)?.position,face:bot.blockAtCursor(4.5)?.face,hit:bot.blockAtCursor(4.5)?.intersect}));}}
finally{for(const a of out.slice(0,-1).reverse()){try{await goChecked(...a);}catch(e){console.log('RETURN_FAIL',String(e));break;}}try{await goChecked(135,-38,2233);}catch(e){console.log(String(e));}bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('END',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState,goal:bot.pathfinder.goal}));}

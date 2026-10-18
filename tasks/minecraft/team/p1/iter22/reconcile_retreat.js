const V=bot.entity.position.constructor;
bot.pathfinder.setGoal(null);bot.clearControlStates();
function state(){return {p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),goal:bot.pathfinder.goal,controls:bot.controlState};}
console.log('RECONCILE',JSON.stringify(state()));
const hp=bot.health;
try{
 if(bot.game.dimension!=='overworld'||bot.health!==20||bot.inventory.items().length||Math.abs(bot.entity.position.x-144.5)>.3||Math.abs(bot.entity.position.y+35)>.1)throw Error('changed life/position');
 const cells=[[143,-37,2231],[143,-36,2231],[143,-35,2231],[143,-34,2231]];
 console.log('CHANGED_DESCENT_PRE',JSON.stringify(cells.map(a=>{const p=new V(...a),b=bot.blockAt(p);return {p,n:b.name,shapes:b.shapes}})));
 if(bot.blockAt(new V(143,-37,2231)).boundingBox!=='block'||[-36,-35,-34].some(y=>bot.blockAt(new V(143,y,2231)).boundingBox!=='empty'))throw Error('blocked direct descent');
 await bot.lookAt(new V(143.5,bot.entity.position.y+1.62,2231.5),true);
 for(let t=0;t<20&&bot.entity.position.x>143.65;t++){bot.setControlState('forward',true);await bot.waitForTicks(1);}bot.clearControlStates();await bot.waitForTicks(20);
 console.log('DIRECT_DESCENT',JSON.stringify(state()));
 if(!bot.entity.onGround||Math.abs(bot.entity.position.y+36)>.1||Math.abs(bot.entity.position.x-143.5)>.8||bot.health!==hp)throw Error('bad descent');
 const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.maxDropDown=3;bot.pathfinder.setMovements(m);
 for(const a of [[142,-36,2231],[141,-36,2231],[140,-36,2231],[139,-36,2231],[138,-36,2231],[138,-37,2232],[138,-38,2233],[137,-38,2233],[136,-38,2233],[135,-38,2233]]){
 let timer;try{await Promise.race([bot.pathfinder.goto(new goals.GoalBlock(...a)),new Promise((_,r)=>timer=setTimeout(()=>r(Error('timeout')),4000))]);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 await bot.waitForTicks(14);const p=bot.entity.position;if(!bot.entity.onGround||Math.abs(p.y-a[1])>.1||Math.hypot(p.x-a[0]-.5,p.z-a[2]-.5)>.8||bot.health!==hp)throw Error('retreat postcondition '+a);console.log('RETURN_NODE',JSON.stringify(state()));
 }
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify(state()));}

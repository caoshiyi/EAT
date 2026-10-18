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
 const foes=Object.values(bot.entities).filter(e=>e.type==='mob'&&e.position.distanceTo(bot.entity.position)<10);console.log('FOES',JSON.stringify(foes.map(e=>({n:e.name,p:e.position}))));if(foes.length)throw Error('mob near bed');
 const p=new V(142,-36,2232),b=bot.blockAt(p);if(b.name!=='white_bed'||b.getProperties().part!=='foot')throw Error('bed changed');
 if(bot.blockAt(p.offset(0,-1,0)).boundingBox!=='block')throw Error('no pickup floor');
 await bot.unequip('hand');await bot.lookAt(p.offset(.5,.3,.5),true);const c=bot.blockAtCursor(4.5);
 if(!c?.position.equals(p)||c.face!==1||![1.62,1.8].every(h=>bot.entity.position.offset(0,h,0).distanceTo(c.intersect)<=4.5))throw Error('bed not visible');
 console.log('BED_DIG_PRE',JSON.stringify({p,hit:c.intersect,face:c.face,props:b.getProperties()}));await bot.dig(b,'ignore',new V(0,1,0));await bot.waitForTicks(12);
 console.log('BED_REMOVAL',JSON.stringify({foot:bot.blockAt(p).name,head:bot.blockAt(p.offset(0,0,1)).name,inv:state().inv}));
 await goChecked(142,-36,2231);await goChecked(142,-36,2232);await bot.waitForTicks(12);
 console.log('BED_RECEIPT',JSON.stringify(state()));if(!bot.inventory.items().some(i=>i.name==='white_bed'&&i.count===1))throw Error('no ordinary bed receipt');
 await goChecked(142,-36,2231);await goChecked(141,-36,2231);
}finally{
 for(const a of out.slice(0,-1).reverse()){try{await goChecked(...a);}catch(e){console.log('RETREAT_FAIL',String(e));break;}}
 try{await goChecked(135,-38,2233);}catch(e){console.log(String(e));}bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify(state()));
}

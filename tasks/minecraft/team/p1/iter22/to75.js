const V=bot.entity.position.constructor;
const movement=new Movements(bot);movement.canDig=false;movement.allow1by1towers=false;movement.allowParkour=false;movement.allowSprinting=false;movement.scafoldingBlocks=[];movement.maxDropDown=1;bot.pathfinder.setMovements(movement);
async function goChecked(x,y,z,ms=15000){
 const before={p:bot.entity.position.clone(),hp:bot.health,dim:bot.game.dimension}; let timer;
 try{await Promise.race([bot.pathfinder.goto(new goals.GoalBlock(x,y,z)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('movement timeout')),ms)})]);}
 finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 for(let n=0;n<20&&!bot.entity.onGround;n++)await bot.waitForTicks(1);
 const p=bot.entity.position;
 const ok=bot.game.dimension===before.dim&&bot.health>0&&bot.health>=before.hp&&bot.entity.onGround&&Math.abs(p.y-y)<=.12&&Math.hypot(p.x-x-.5,p.z-z-.5)<=.8;
 console.log('CHECKED_LEG',JSON.stringify({target:[x,y,z],before,p,hp:bot.health,ground:bot.entity.onGround,goal:bot.pathfinder.goal,controls:bot.controlState,ok}));if(!ok)throw Error('physical postcondition failed');
}

const full=p=>bot.blockAt(p)?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');
function safe(x,z){return full(new V(x,49,z))&&full(new V(x,52,z))&&[50,51].every(y=>bot.blockAt(new V(x,y,z))?.boundingBox==='empty');}
const start=bot.entity.position.floored(),queue=[[start.x,start.z]],prev=new Map([[`${start.x},${start.z}`,null]]);let end,path=[];
for(let n=0;n<queue.length;n++){const [x,z]=queue[n];if(x===75&&z===0){end=[x,z];break;}for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=z+dz,k=`${a},${b}`;if(a<0||a>76||b< -5||b>6||prev.has(k)||!safe(a,b))continue;prev.set(k,[x,z]);queue.push([a,b]);}}
if(end){for(let a=end;a;a=prev.get(a.join(',')))path.push(a);path.reverse();}console.log('COVERED_PATH',JSON.stringify(path));
try{if(bot.game.dimension!=='the_end'||bot.health!==20||!path.length)throw Error('courier guard');
for(let i=1;i<path.length;i++){if(i<path.length-1&&path[i][0]-path[i-1][0]===path[i+1][0]-path[i][0]&&path[i][1]-path[i-1][1]===path[i+1][1]-path[i][1])continue;await goChecked(path[i][0],50,path[i][1]);}
console.log('STAGING_NATIVE75',JSON.stringify({p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),players:Object.values(bot.entities).filter(e=>e.type==='player').map(e=>({n:e.username,p:e.position}))}));
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,dim:bot.game.dimension,inv:bot.inventory.items().map(i=>[i.name,i.count]),goal:bot.pathfinder.goal,controls:bot.controlState}));}

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
for(let n=0;n<queue.length;n++){const [x,z]=queue[n];if(x===7&&z===3){end=[x,z];break;}for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=z+dz,k=`${a},${b}`;if(a<0||a>76||b< -5||b>6||prev.has(k)||!safe(a,b))continue;prev.set(k,[x,z]);queue.push([a,b]);}}
if(end){for(let a=end;a;a=prev.get(a.join(',')))path.push(a);path.reverse();}console.log('COVERED_PATH',JSON.stringify(path));
try{if(bot.game.dimension!=='the_end'||bot.health!==20||!path.length)throw Error('courier guard');
for(let i=1;i<path.length;i++){if(i<path.length-1&&path[i][0]-path[i-1][0]===path[i+1][0]-path[i][0]&&path[i][1]-path[i-1][1]===path[i+1][1]-path[i][1])continue;await goChecked(path[i][0],50,path[i][1]);}
console.log('NATIVE7_START',JSON.stringify({p:bot.entity.position,hp:bot.health}));
const route=[[3,50,3],[3,50,4],[2,50,4],[1,50,4],[0,50,4],[0,50,3],[1,51,3],[2,52,3],[3,53,3],[4,54,3],[5,55,3],[6,56,3]];let done=[];
const danger=()=>Object.values(bot.entities).some(e=>e.name==='area_effect_cloud'&&e.position.y+(e.height||.5)>bot.entity.position.y&&e.position.y<bot.entity.position.y+1.9&&Math.hypot(e.position.x-bot.entity.position.x,e.position.z-bot.entity.position.z)<Number(e.metadata?.[8]||3)+.6);
try{
 for(const a of route){if(bot.health!==20||danger())throw Error('fresh health/cloud guard');await goChecked(...a,4000);done.push(a);}
 const target=new V(6.7,56,3.31);for(let n=0;n<15&&Math.hypot(bot.entity.position.x-target.x,bot.entity.position.z-target.z)>.05;n++){if(bot.health!==20||danger())throw Error('pickup health/cloud');await bot.lookAt(new V(target.x,57.62,target.z),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}bot.clearControlStates();await bot.waitForTicks(12);
 console.log('LOWER56_RECEIPT',JSON.stringify({p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),items:Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5).map(e=>({id:e.id,p:e.position,n:bot.registry.items[e.metadata?.[8]?.itemId]?.name}))}));
}finally{
 bot.pathfinder.setGoal(null);bot.clearControlStates();
 for(const a of done.slice(0,-1).reverse()){try{await goChecked(...a,4000);}catch(e){console.log('RETURN_NODE_ERROR',String(e));if(bot.game.dimension!=='the_end'||bot.health<=0)break;}}
 if(bot.game.dimension==='the_end'&&bot.health>0&&bot.entity.position.y<50.2){try{await goChecked(7,50,3,5000);}catch(e){console.log('RETURN_NATIVE_ERROR',String(e));}}
}
}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('TERMINAL',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,dim:bot.game.dimension,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),goal:bot.pathfinder.goal,controls:bot.controlState}));}

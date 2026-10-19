const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),src=bot.entity.position.clone(),rows=[],began=Date.now();let timer;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,dim:bot.game.dimension,controls:Object.fromEntries(['forward','jump','sneak'].map(k=>[k,bot.getControlState(k)]))});
try{
bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('NEAR_GOAL_SOURCE',JSON.stringify(snap()));if(bot.game.dimension!=='the_nether'||bot.health!==20||src.distanceTo(v(4.5,65,2.3))>.3)throw Error('actual near source');
const map=[];for(let x=3;x<=7;x++)for(let z=0;z<=3;z++)map.push({x,z,n:[64,65,66,67].map(y=>bot.blockAt(v(x,y,z))?.name)});console.log('ACTUAL_EXIT_BLOCKS',JSON.stringify(map));
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=true;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;
for(const n of['water','lava'])if(bot.registry.blocksByName[n]&&m.blocksToAvoid?.add)m.blocksToAvoid.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);
const goal=new goals.GoalNear(6,65,2,1),r=bot.pathfinder.getPathTo(m,goal,1000);console.log('LOCAL_PLANNER_ONLY',JSON.stringify({status:r.status,len:r.path?.length,path:r.path?.slice(0,8).map(p=>({x:p.x,y:p.y,z:p.z}))}));
const update=r=>{if(rows.length<8)rows.push({status:r.status,path:r.path?.slice(0,5).map(p=>({x:p.x,y:p.y,z:p.z}))});};bot.on('path_update',update);
try{await Promise.race([bot.pathfinder.goto(goal),new Promise((_,rej)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);rej(Error('near5sec'));},5000))]);}finally{clearTimeout(timer);bot.removeListener('path_update',update);}
console.log('NEAR_GOAL_ARRIVAL',JSON.stringify(snap()));
}catch(e){console.log('NEAR_GOAL_FAILURE',String(e),JSON.stringify(snap()));}
finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('NEAR_GOAL_END',JSON.stringify({state:snap(),rows,elapsedMs:Date.now()-began}));}
return snap();

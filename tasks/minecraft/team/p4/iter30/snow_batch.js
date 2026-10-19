const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),home=v(7,67,-23),tableQ=v(8,67,-23),began=Date.now();let dead=false,ending=false;
const cnt=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0),snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])});
const death=()=>{dead=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',death);
const guard=()=>{if(dead||bot.health<=0||(!ending&&bot.health<18)||bot.game.dimension!=='overworld'||Date.now()-began>(ending?145000:95000))throw Error('life/health/budget');};
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return c;}throw Error('not visible '+q);}
async function craft(n,t,table=null){const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('unfundedrecipe '+n);await bot.craft(r,t,table);await bot.waitForTicks(3);console.log('SNOW_CRAFT',JSON.stringify({n,state:snap()}));}
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];m.maxDropDown=1;m.infiniteLiquidDropdownDistance=false;
for(const n of['water','lava'])if(bot.registry.blocksByName[n]&&m.blocksToAvoid?.add)m.blocksToAvoid.add(bot.registry.blocksByName[n].id);
m.liquidCost=100;if(Array.isArray(m.exclusionAreasStep))m.exclusionAreasStep.push(b=>['water','lava'].includes(b.name)||b.position.x<3?Infinity:0);bot.pathfinder.setMovements(m);
async function go(goal){guard();let timer;try{await Promise.race([bot.pathfinder.goto(goal),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('route20s'));},20000))]);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}guard();}
async function restore(){
const ref=tableQ.offset(0,-1,0);if(bot.blockAt(tableQ)?.name!=='crafting_table'){await face(ref,1);await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));await bot.waitForTicks(3);}
if(bot.blockAt(tableQ.offset(0,1,0))?.name!=='spruce_planks'){bot.setControlState('sneak',true);try{await bot.waitForTicks(3);await face(tableQ,1);await bot.equip(bot.inventory.items().find(i=>i.name==='spruce_planks'),'hand');await bot.placeBlock(bot.blockAt(tableQ),v(0,1,0));}finally{bot.setControlState('sneak',false);}}
}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('SNOW_SOURCE',JSON.stringify(snap()));if(!bot.entity.position.floored().equals(home)||bot.health!==20)throw Error('actual Snow source');
await craft('spruce_planks',1);await craft('stick',1);await face(tableQ);await craft('wooden_sword',1,bot.blockAt(tableQ));
for(const q of[tableQ.offset(0,1,0),tableQ]){await face(q);await bot.unequip('hand');await bot.dig(bot.blockAt(q),true,'raycast');await bot.waitForTicks(5);}
console.log('SNOW_EXIT_OPEN',JSON.stringify(snap()));
for(let k=0;k<20&&cnt('snowball')<16;k++){
guard();const qs=bot.findBlocks({matching:b=>b.name==='snow',maxDistance:14,count:50}).filter(q=>q.x>=3).sort((a,b)=>a.distanceTo(bot.entity.position)-b.distanceTo(bot.entity.position));if(!qs.length)break;
let done=false;for(const q of qs.slice(0,6)){try{
await go(new goals.GoalBlock(q.x,q.y,q.z));if(!bot.entity.position.floored().equals(q))throw Error('Snow actualfoot');const b=bot.blockAt(q);if(b?.name!=='snow')continue;
const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),aim=q.offset(.5,.1,.5),dv=aim.minus(eye),first=bot.world.raycast(eye,dv.scaled(1/dv.norm()),dv.norm()-.01);if(dv.norm()>4.5||(first&&!first.position.equals(q)))throw Error('Snow current ray blocked');
await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_shovel'),'hand');await bot.lookAt(aim,true);await bot.waitForTicks(2);const before=cnt('snowball');await bot.dig(b,true);await bot.waitForTicks(16);console.log('ACTUAL_SNOW_RECEIPT',JSON.stringify({q,before,after:cnt('snowball'),state:snap()}));done=true;break;
}catch(e){console.log('SNOW_PATCH_REFUSAL',String(e));guard();}}
if(!done)break;
}
}catch(e){console.log('SNOW_FAILURE',String(e),JSON.stringify(snap()));}
finally{
ending=true;bot.pathfinder.setGoal(null);bot.clearControlStates();
if(!dead&&bot.game.dimension==='overworld'&&bot.health>0)try{await go(new goals.GoalBlock(7,67,-23));await restore();}catch(e){console.log('SNOW_ENDING_FAILURE',String(e),JSON.stringify(snap()));}
bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',death);await bot.waitForTicks(8);
const faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>{const b=bot.blockAt(home.offset(...d));return{p:b?.position,n:b?.name,full:b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')||false};});console.log('SNOW_END',JSON.stringify({state:snap(),faces}));}
return snap();

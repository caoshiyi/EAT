const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),home=v(7,67,-23),tableQ=v(8,67,-23),began=Date.now();let dead=false,ending=false;
const cnt=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0),snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])});
const death=()=>{dead=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',death);
const guard=()=>{if(dead||bot.health<=0||(!ending&&bot.health<18)||bot.game.dimension!=='overworld'||Date.now()-began>(ending?112000:75000))throw Error('life/health/budget');};
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return c;}throw Error('not visible '+q);}
async function craft(n,t,table=null){const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('unfundedrecipe '+n);await bot.craft(r,t,table);await bot.waitForTicks(3);console.log('SNOW_CRAFT',JSON.stringify({n,state:snap()}));}
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=true;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];m.maxDropDown=1;m.infiniteLiquidDropdownDistance=false;
for(const n of['water','lava'])if(bot.registry.blocksByName[n]&&m.blocksToAvoid?.add)m.blocksToAvoid.add(bot.registry.blocksByName[n].id);
m.liquidCost=100;if(Array.isArray(m.exclusionAreasStep))m.exclusionAreasStep.push(b=>['water','lava'].includes(b.name)?Infinity:0);bot.pathfinder.setMovements(m);
async function go(goal){guard();let timer;try{await Promise.race([bot.pathfinder.goto(goal),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('route20s'));},20000))]);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}guard();}
async function restore(){
const ref=tableQ.offset(0,-1,0);if(bot.blockAt(tableQ)?.name!=='crafting_table'){await face(ref,1);await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));await bot.waitForTicks(3);}
if(bot.blockAt(tableQ.offset(0,1,0))?.name!=='spruce_planks'){bot.setControlState('sneak',true);try{await bot.waitForTicks(3);await face(tableQ,1);await bot.equip(bot.inventory.items().find(i=>i.name==='spruce_planks'),'hand');await bot.placeBlock(bot.blockAt(tableQ),v(0,1,0));}finally{bot.setControlState('sneak',false);}}
}
let entered=false;
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('PORTAL_PROBE_SOURCE',JSON.stringify({...snap(),dim:bot.game.dimension}));
if(!bot.entity.position.floored().equals(home)||bot.health!==20)throw Error('actual portalprobesource');
for(const q of[tableQ.offset(0,1,0),tableQ]){await face(q);await bot.unequip('hand');await bot.dig(bot.blockAt(q),true,'raycast');await bot.waitForTicks(5);}
await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_sword'),'hand');
for(const [x,z]of[[18,-16],[22,8],[22,62]]){
await go(new goals.GoalXZ(x,z));console.log('ACTUAL_PORTAL_WAYPOINT',JSON.stringify({...snap(),target:[x,z],dim:bot.game.dimension}));
}
await go(new goals.GoalNear(7,68,90,1));console.log('ACTUAL_FRAME_APPROACH',JSON.stringify({...snap(),portal:bot.blockAt(v(7,68,91))?.name,floor:bot.blockAt(v(7,67,91))?.name}));
if(bot.blockAt(v(7,68,91))?.name!=='nether_portal'||bot.blockAt(v(7,67,91))?.boundingBox!=='block')throw Error('actual activeportal/supportmissing');
await bot.lookAt(v(7.5,bot.entity.position.y+1.62,91.5),true);bot.setControlState('forward',true);
for(let k=0;k<30&&bot.game.dimension==='overworld'&&bot.entity.position.z<91.45;k++){await bot.waitForTicks(1);if(bot.health<18)throw Error('portalapproachdamage');}
bot.clearControlStates();for(let k=0;k<140&&bot.game.dimension==='overworld';k++)await bot.waitForTicks(1);
entered=bot.game.dimension==='the_nether';console.log('ACTUAL_PORTAL_TRANSITION',JSON.stringify({...snap(),dim:bot.game.dimension,entered}));
}catch(e){console.log('PORTAL_PROBE_FAILURE',String(e),JSON.stringify({...snap(),dim:bot.game.dimension}));}
finally{
ending=true;bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',death);
if(bot.game.dimension==='overworld'&&bot.health>0)try{
const q=bot.entity.position.floored(),full=p=>bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
async function put(p){if(full(p))return;if(['nether_portal','end_portal'].includes(bot.blockAt(p)?.name))throw Error('endingintersectsactiveportal');for(const d of[v(0,-1,0),v(1,0,0),v(-1,0,0),v(0,0,1),v(0,0,-1)]){const ref=p.plus(d);if(!full(ref))continue;try{const f=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)].findIndex(x=>x.equals(d.scaled(-1)));await face(ref,f);}catch{continue;}const i=bot.inventory.items().find(i=>['dirt','spruce_planks'].includes(i.name));if(!i)throw Error('no localcap');await bot.equip(i,'hand');await bot.placeBlock(bot.blockAt(ref),d.scaled(-1));await bot.waitForTicks(2);if(bot.game.dimension!=='overworld')throw Error('endingdimensionchanged');return;}throw Error('no visible endinganchor');}
if(!bot.entity.onGround||!full(q.offset(0,-1,0)))throw Error('no actuallocalfloor');
for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){await put(q.offset(dx,0,dz));await put(q.offset(dx,1,dz));}
bot.setControlState('jump',true);try{for(let k=0;k<10&&bot.entity.position.y<q.y+.65;k++)await bot.waitForTicks(1);await put(q.offset(1,2,0));}finally{bot.setControlState('jump',false);}await bot.waitForTicks(10);await put(q.offset(0,2,0));console.log('ACTUAL_ROUTE_ENDING',JSON.stringify({...snap(),cell:q}));
}catch(e){console.log('PORTAL_ENDING_FAILURE',String(e));}
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('PORTAL_PROBE_END',JSON.stringify({...snap(),dim:bot.game.dimension,entered,hazards:Object.values(bot.entities).filter(e=>['ghast','magma_cube','blaze','skeleton','zombie','creeper'].includes(e.name)).map(e=>({n:e.name,p:e.position.clone(),d:e.position.distanceTo(bot.entity.position)})).filter(e=>e.d<24)}));
}
return {...snap(),dimension:bot.game.dimension};

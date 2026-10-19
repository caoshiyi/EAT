const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),began=Date.now(),startHp=bot.health;let death=false,timer;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),time:bot.time.timeOfDay});
const died=()=>{death=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',died);
const guard=()=>{if(death||bot.health<16||bot.game.dimension!=='overworld'||Date.now()-began>110000)throw Error('life/health/budget');};
const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.scaffoldingBlocks=[];m.maxDropDown=1;m.liquidCost=Infinity;for(const n of ['water','lava'])if(bot.registry.blocksByName[n]&&m.blocksToAvoid?.add)m.blocksToAvoid.add(bot.registry.blocksByName[n].id);if(Array.isArray(m.exclusionAreasStep))m.exclusionAreasStep.push(b=>['water','lava'].includes(b.name)||b.position.x<3?Infinity:0);bot.pathfinder.setMovements(m);
async function go(g){guard();let timer;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,reject)=>timer=setTimeout(()=>{bot.pathfinder.setGoal(null);reject(Error('navigation budget25s'));},25000))]);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}guard();}
async function see(q){for(const a of [[.5,.5,.5],[.5,.01,.5],[.5,.99,.5],[.01,.5,.5],[.99,.5,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const b=bot.blockAtCursor(4.5);if(b?.position.equals(q))return b;}throw Error('not current visible '+q);}
try{
console.log('BERRY_SOURCE',JSON.stringify(snap()));if(bot.health!==20||bot.entity.position.distanceTo(v(7.6476,67,-22.49687))>.2)throw Error('actual berry source');
const q=v(7,67,-22),b=bot.blockAt(q);if(b?.name!=='sweet_berry_bush')throw Error('actual berry missing');await see(q);await bot.activateBlock(b);await bot.waitForTicks(15);console.log('BERRY_AFTER_ACTUAL_USE',JSON.stringify({properties:bot.blockAt(q)?.getProperties(),state:snap()}));
await see(q);await bot.unequip('hand');await bot.dig(bot.blockAt(q),true,'raycast');await bot.waitForTicks(15);console.log('BERRY_CLEAR_RECEIPT',JSON.stringify(snap()));
}catch(e){console.log('ACQUIRE_FAILURE',String(e));}
finally{
bot.pathfinder.setGoal(null);bot.clearControlStates();
try{

const q=bot.entity.position.floored(),full=p=>bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
async function put(p){if(full(p))return;for(const d of [v(0,-1,0),v(1,0,0),v(-1,0,0),v(0,0,1),v(0,0,-1),v(0,1,0)]){const ref=p.plus(d);if(!full(ref))continue;for(const a of [[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99]]){await bot.lookAt(ref.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5),dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];if(!c?.position.equals(ref)||!dirs[c.face].equals(d.scaled(-1)))continue;const i=bot.inventory.items().find(i=>i.name==='spruce_planks');if(!i)throw Error('no shelterplanks');await bot.equip(i,'hand');await bot.placeBlock(bot.blockAt(ref),d.scaled(-1));return;}}throw Error('no visible shelteranchor '+p);}
if(!bot.entity.onGround||!full(q.offset(0,-1,0)))throw Error('not actual shelterfloor');
for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){await put(q.offset(dx,0,dz));await put(q.offset(dx,1,dz));}
bot.setControlState('jump',true);try{for(let k=0;k<10&&bot.entity.position.y<q.y+.65;k++)await bot.waitForTicks(1);await put(q.offset(1,2,0));}finally{bot.setControlState('jump',false);}await bot.waitForTicks(12);await put(q.offset(0,2,0));
const faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({p:q.offset(...d),n:bot.blockAt(q.offset(...d))?.name,full:full(q.offset(...d))}));
console.log('ACTUAL_SHELTER',JSON.stringify({faces,state:snap()}));
}catch(e){console.log('SHELTER_FAILURE',String(e),JSON.stringify(snap()));}
bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',died);console.log('ACQUIRE_END',JSON.stringify(snap()));}
return snap();

const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),p=bot.entity.position.clone(),before=bot.health,began=Date.now();let dead=false;
const die=()=>{dead=true;bot.pathfinder.setGoal(null);bot.clearControlStates();};bot.on('death',die);
const s=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inv:bot.inventory.items().map(i=>[i.name,i.count]),near:Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(bot.entity.position)<8).map(e=>({n:e.name,p:e.position.clone(),d:e.position.distanceTo(bot.entity.position)}))});
const guard=()=>{if(dead||bot.health<=0||bot.game.dimension!=='overworld'||Date.now()-began>18000)throw Error('life/time');};
async function see(q){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q))return c;}throw Error('notvisible '+q);}
async function put(q){for(const d of[v(0,-1,0),v(-1,0,0),v(1,0,0),v(0,0,-1),v(0,0,1)]){const ref=q.plus(d),b=bot.blockAt(ref);if(b?.boundingBox!=='block')continue;const f=d.scaled(-1);for(const a of[[.5,.99,.5],[.01,.01,.5],[.99,.01,.5],[.5,.01,.01],[.5,.01,.99],[.5,.5,.5]]){await bot.lookAt(ref.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(ref))continue;const faces=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];if(!faces[c.face].equals(f))continue;const i=bot.inventory.items().find(i=>i.name==='spruce_planks');if(!i)throw Error('no planks');await bot.equip(i,'hand');await bot.placeBlock(b,f);return;}}throw Error('no visible cap anchor');}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('EMERGENCY_SOURCE',JSON.stringify(s()));
if(p.distanceTo(v(14.34,74,-40.5))>2||!bot.inventory.items().some(i=>i.name==='spruce_log'))throw Error('oldbodychanged');
const r=bot.recipesFor(bot.registry.itemsByName.spruce_planks.id,null,1,null)[0];if(r)await bot.craft(r,1);
for(let k=0;k<2;k++){guard();const q=bot.entity.position.floored(),b=bot.blockAt(q.offset(0,-1,0)),below=bot.blockAt(q.offset(0,-2,0));if(!['grass_block','dirt'].includes(b?.name)||below?.boundingBox!=='block')throw Error('cannot safe soilDOWN');await see(b.position);await bot.unequip('hand');await bot.dig(b,true,'raycast');await bot.waitForTicks(6);console.log('EMERGENCY_DOWN',JSON.stringify(s()));}
const q=bot.entity.position.floored();bot.setControlState('jump',true);try{for(let k=0;k<10&&bot.entity.position.y<q.y+.65;k++)await bot.waitForTicks(1);await put(q.offset(1,2,0));}finally{bot.setControlState('jump',false);}
await bot.waitForTicks(10);await put(q.offset(0,2,0));console.log('EMERGENCY_CAP',JSON.stringify(s()));
}catch(e){console.log('EMERGENCY_FAILURE',String(e),JSON.stringify(s()));}
finally{bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',die);console.log('EMERGENCY_END',JSON.stringify(s()));}
return s();

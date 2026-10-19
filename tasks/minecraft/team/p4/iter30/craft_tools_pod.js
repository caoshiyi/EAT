const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),cell=v(7,67,-23),tableQ=v(8,67,-23);
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0),snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,inventory:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])});
async function face(q){for(const a of[[.5,.5,.5],[.01,.5,.5],[.5,.99,.5],[.5,.01,.5]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q))return c;}throw Error('not current visible '+q);}
async function craft(n,times,table=null){const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('no fundedrecipe '+n);await bot.craft(r,times,table);await bot.waitForTicks(4);console.log('ACTUAL_CRAFT',JSON.stringify({n,times,state:snap()}));}
async function install(n){const q=tableQ.offset(0,-1,0);await face(q);const c=bot.blockAtCursor(4.5);if(c.face!==1)throw Error('table floor nottop');const i=bot.inventory.items().find(i=>i.name===n);if(!i)throw Error('no install '+n);await bot.equip(i,'hand');await bot.placeBlock(bot.blockAt(q),v(0,1,0));await bot.waitForTicks(4);if(bot.blockAt(tableQ)?.name!==n)throw Error('install notactual');}
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);await bot.waitForTicks(4);console.log('CRAFT_SOURCE',JSON.stringify(snap()));if(bot.health!==20||bot.entity.position.floored().distanceTo(cell)>0||count('spruce_log')<2)throw Error('actual source');
await craft('spruce_planks',2);await craft('crafting_table',1);
if(bot.blockAt(tableQ)?.name!=='spruce_planks')throw Error('expected ownwall');
await face(tableQ);await bot.unequip('hand');await bot.dig(bot.blockAt(tableQ),true,'raycast');await bot.waitForTicks(4);await install('crafting_table');
const table=bot.blockAt(tableQ);await face(tableQ);await craft('stick',1);await craft('wooden_pickaxe',1,table);await craft('wooden_shovel',1,table);
}catch(e){console.log('CRAFT_FAILURE',String(e),JSON.stringify(snap()));}
finally{
if(bot.blockAt(tableQ)?.boundingBox==='empty'){try{await install(count('crafting_table')?'crafting_table':'spruce_planks');}catch(e){console.log('CRAFT_RESEAL_FAILURE',String(e));}}
bot.clearControlStates();bot.pathfinder.setGoal(null);
for(let k=0;k<3;k++){await bot.waitForTicks(4);const faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>{const b=bot.blockAt(cell.offset(...d));return{p:b?.position,n:b?.name,full:b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')||false};});console.log('CRAFT_ENDING',JSON.stringify({faces,state:snap()}));}
}
return snap();

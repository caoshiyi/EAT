const V=bot.entity.position.constructor;bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(30);
function state(){return {p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState,goal:bot.pathfinder.goal};}
console.log('RECONCILE',JSON.stringify(state()));if(bot.game.dimension!=='overworld'||bot.health!==20)throw Error('life changed');
const logs=bot.inventory.items().find(i=>i.name==='spruce_log');if(!logs||logs.count!==3)throw Error('need ordinary thirdlog; no extra cut');
for(const [name,count,table] of [['spruce_planks',3,null],['crafting_table',1,null]]){const r=bot.recipesFor(bot.registry.itemsByName[name].id,null,1,table)[0];if(!r)throw Error('recipe absent '+name);await bot.craft(r,count,table);console.log('CRAFT',JSON.stringify({name,inv:state().inv}));}
let placed=null;
for(const a of [[11,73,-40],[10,73,-39],[11,73,-39],[10,73,-41]]){
 const p=new V(...a),b=bot.blockAt(p),ref=bot.blockAt(p.offset(0,-1,0));if(b?.boundingBox!=='empty'||!ref?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1'))continue;
 await bot.lookAt(ref.position.offset(.5,.99,.5),true);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(ref.position)||c.face!==1||![1.62,1.8].every(h=>bot.entity.position.offset(0,h,0).distanceTo(c.intersect)<=4.5))continue;
 await bot.equip(bot.inventory.items().find(i=>i.name==='crafting_table'),'hand');console.log('TABLE_PRE',JSON.stringify({p,ref:ref.position,hit:c.intersect}));await bot.placeBlock(ref,new V(0,1,0));await bot.waitForTicks(4);if(bot.blockAt(p).name!=='crafting_table')throw Error('no actual table');placed=p;break;
}
console.log('TABLE_ACTUAL',JSON.stringify({placed,state:state()}));if(!placed)throw Error('no visible full-floor table position');
const table=bot.blockAt(placed);await bot.lookAt(placed.offset(.5,.5,.5),true);const c=bot.blockAtCursor(4.5);if(!c?.position.equals(placed))throw Error('table not visible for craft');
const r=bot.recipesFor(bot.registry.itemsByName.spruce_boat.id,null,1,table)[0];if(!r)throw Error('boat recipe absent');await bot.craft(r,1,table);await bot.waitForTicks(4);console.log('BOAT_ORDINARY',JSON.stringify(state()));

const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();
const out={p:bot.entity.position,hp:bot.health,food:bot.food,dimension:bot.game.dimension,time:bot.time,controls:bot.controlState,inventory:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),globals:Object.keys(global).filter(k=>k.startsWith('P3')).map(k=>[k,typeof global[k]]),blocks:[],stock:[]};
for(const p of [[6,67,81],[7,67,81],[6,67,83],[7,67,83],[7,66,83]]){const b=bot.blockAt(new Vec3(...p));out.blocks.push({p,name:b?.name,properties:b?.getProperties()});}
for(const y of [67,68]){let c;try{c=await bot.openChest(bot.blockAt(new Vec3(7,y,82)));out.stock.push({y,items:c.containerItems().map(i=>[i.name,i.count,i.durabilityUsed])});}finally{if(c)await c.close();}}
out.mobs=Object.values(bot.entities).filter(e=>e.kind==='Hostile mobs'&&e.position.distanceTo(bot.entity.position)<20).map(e=>[e.id,e.name,e.position]);return out;

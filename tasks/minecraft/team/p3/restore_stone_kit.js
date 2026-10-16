const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();
if(bot.game.dimension!=='overworld'||bot.health<18||bot.entity.position.distanceTo(new Vec3(7,67.56,83))>1.5)throw Error('camp start');
const c=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));
try{console.log('BEFORE',c.containerItems().map(i=>[i.name,i.count]));for(const [n,k] of [['spruce_planks',2],['cobblestone',5]]){const i=c.containerItems().find(i=>i.name===n);if(!i||i.count<k)throw Error('missing '+n);await c.withdraw(i.type,null,k);}}finally{c.close();await bot.waitForTicks(6);}
for(const [n,table] of [['stick',null],['stone_pickaxe',bot.blockAt(new Vec3(6,66,82))]]){const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,table)[0];if(!r)throw Error('recipe '+n);await bot.craft(r,1,table);await bot.waitForTicks(8);}
if(!bot.inventory.items().some(i=>i.name==='stone_pickaxe'&&i.durabilityUsed===0))throw Error('no actual fresh pick');
console.log('ACTUAL_KIT',bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]));
for(const q of [[0,41,87],[-1,41,87],[-1,40,88],[-2,40,88]]){const bad=[];for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(let dy=0;dy<=3;dy++){const b=bot.blockAt(new Vec3(q[0]+dx,q[1]+dy,q[2]+dz));if(!b||/water|lava|gravel|sand$/.test(b.name))bad.push([b?.name,b?.position]);}console.log('ORE_SNAPSHOT',q,'target',bot.blockAt(new Vec3(...q))?.name,'bad',bad);}

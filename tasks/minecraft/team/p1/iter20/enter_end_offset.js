let b=bot.blockAt(bot.entity.position.floored().offset(0,-1,0));
if(bot.game.dimension!=='overworld'||b.name!=='basalt')throw Error('unexpected stage');
await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');await bot.lookAt(b.position.offset(.67,.95,.62),true);await bot.waitForTicks(2);
let cursor=bot.blockAtCursor(4.5);console.log('CUT_PRE',JSON.stringify({p:bot.entity.position,b:b.position,name:b.name,eyeDistance:bot.entity.position.offset(0,1.62,0).distanceTo(b.position.offset(.67,.95,.62)),visible:bot.canSeeBlock(b),cursor:cursor?.position}));
if(!cursor||!cursor.position.equals(b.position)||!bot.canSeeBlock(b))throw Error('no visible cursor');
await bot.dig(b);await bot.waitForTicks(12);bot.clearControlStates();
console.log('AFTER',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,entities:Object.values(bot.entities).map(e=>({id:e.id,name:e.name,p:e.position,width:e.width,height:e.height,metadata:e.name==='ender_dragon'?e.metadata:undefined})),blocks:bot.findBlocks({matching:b=>b.boundingBox==='block',maxDistance:8,count:100}).map(p=>({p,name:bot.blockAt(p).name}))}));

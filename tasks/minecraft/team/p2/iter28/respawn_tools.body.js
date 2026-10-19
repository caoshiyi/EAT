console.log('ENVIRONMENT G28-2 OWactualsurface source20HP/log2; ordinaryblocking-leaves first then actualtools/Snow/berries');
async function clearVisible(q){for(let k=0;k<4;k++){await bot.lookAt(q.offset(.5,.5,.5),true);await sleep(1);const c=bot.blockAtCursor(4.5);console.log('ACTUAL_CURSOR_BLOCK',JSON.stringify({wanted:q,actual:c?{p:c.position,name:c.name}:null}));if(c?.position.equals(q)){await cut(q,[bot.blockAt(q).name]);return;}if(c&&['spruce_leaves','oak_leaves','snow','grass','fern'].includes(c.name)){await cut(c.position,[c.name]);continue;}throw Error('actual blocker not cleared '+c?.name);}throw Error('visibleblockbudget');}
try{
 if(bot.game.dimension!=='overworld'||bot.health!==20||count('spruce_log')!==2)throw Error('tools sourcechanged');
 for(const q of[v(4,69,-23),v(4,70,-23)]){if(bot.blockAt(q)?.name==='spruce_log')await clearVisible(q);}
 await craft('spruce_planks');await craft('spruce_planks');if(count('spruce_log')>0)await craft('spruce_planks');
 await craft('stick');await craft('crafting_table');const tableCell=bot.entity.position.floored().offset(1,0,0);if(!full(tableCell.offset(0,-1,0)))throw Error('table actualsupport');if(bot.blockAt(tableCell)?.name==='snow')await cut(tableCell,['snow']);await put(tableCell,'crafting_table');const table=bot.blockAt(tableCell);
 await craft('wooden_shovel',table);if(bot.recipesFor(bot.registry.itemsByName.wooden_pickaxe.id,null,1,table).length)await craft('wooden_pickaxe',table);
 const berry=v(4,67,-22);if(bot.blockAt(berry)?.name==='sweet_berry_bush'){await clearVisible(berry);await travel(berry,10000,0,false,18);await sleep(10);}
 const sh=bot.inventory.items().find(i=>i.name==='wooden_shovel');if(!sh)throw Error('no shovel');
 for(let k=0;k<8&&count('snowball')<8;k++){const qs=bot.findBlocks({matching:bot.registry.blocksByName.snow.id,maxDistance:3,count:24}).sort((a,b)=>a.distanceTo(bot.entity.position)-b.distanceTo(bot.entity.position));let done=false;for(const q of qs){try{await face(q);await bot.equip(sh,'hand');const before=count('snowball');await bot.dig(bot.blockAt(q));await sleep(10);console.log('ACTUAL_SNOW_HARVEST',JSON.stringify({at:new Date().toISOString(),q,before,after:count('snowball')}));done=true;break;}catch(e){}}if(!done)break;}
 console.log('ACTUAL_SUPPLY_RESULT',JSON.stringify(state()));
}catch(e){console.log('FAILURE',String(e),JSON.stringify(state()));}
finally{stop();console.log('ACTUAL_SURFACE_POST',JSON.stringify(state()));}return state();

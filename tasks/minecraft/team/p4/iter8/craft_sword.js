const{Vec3}=require('vec3');let lost=false;const halt=()=>{lost=true;bot.clearControlStates();};bot.on('death',halt);bot.on('respawn',halt);const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
async function settle(){await bot.waitForTicks(4);if(lost||bot.game.dimension!=='overworld'||bot.health<18)throw Error('LIFE');}
async function stash(){const c=bot.inventory.selectedItem;if(!c)return;let i=Array.from({length:36},(_,i)=>i+9).find(i=>!bot.inventory.slots[i]);if(i===undefined)throw Error('CURSOR_FULL');await bot.clickWindow(i,0,0);await settle();if(bot.inventory.selectedItem)throw Error('CURSOR_STASH_FAILED');}
async function craft(name,table){let r=bot.recipesFor(bot.registry.itemsByName[name].id,null,1,table)[0];if(!r)throw Error('MISSING_RECIPE_'+name);await bot.craft(r,1,table);await settle();await stash();console.log('CRAFT_POST',name,JSON.stringify(bot.inventory.items().map(i=>[i.name,i.count])));}
try{
 bot.clearControlStates();bot.pathfinder.setGoal(null);if(bot.entity.position.x<6||bot.entity.position.x>8||bot.entity.position.z<82||bot.entity.position.z>84)throw Error('NOT_CAMP');
 const before=count('wooden_sword');await stash();if(count('spruce_log')<1)throw Error('NO_LOG');
 await craft('spruce_planks',null);if(count('spruce_planks')<4)throw Error('PLANK_POST');
 await craft('stick',null);const table=bot.blockAt(new Vec3(6,66,82));if(table?.name!=='crafting_table')throw Error('TABLE_CHANGED');
 await craft('wooden_sword',table);if(count('wooden_sword')<=before)throw Error('SWORD_RECEIPT');await bot.equip(bot.inventory.items().find(i=>i.name==='wooden_sword'),'hand');
 console.log('SWORD_ACCEPTED',count('wooden_sword')-before,bot.heldItem.name,bot.health);
}finally{bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',halt);bot.removeListener('respawn',halt);console.log('END',JSON.stringify({p:bot.entity.position,hp:bot.health,lost,items:bot.inventory.items().map(i=>[i.name,i.count]),cursor:bot.inventory.selectedItem?.name}));}

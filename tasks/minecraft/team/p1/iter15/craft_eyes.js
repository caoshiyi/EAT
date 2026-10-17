// Selected destination craft. Default batch for fresh remaining frames; set
// global.P1CraftOne=true only for an incoming partial unit. Not a courier trigger.
const{Vec3}=require('vec3');bot.clearControlStates();bot.pathfinder.setGoal(null);
const self=bot.entity,start=Date.now(),deadline=1792250260000;
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
const snap=()=>({rod:count('blaze_rod'),powder:count('blaze_powder'),pearl:count('ender_pearl'),eye:count('ender_eye'),cursor:bot.inventory.selectedItem&&{name:bot.inventory.selectedItem.name,count:bot.inventory.selectedItem.count},grid:bot.inventory.slots.slice(0,5).map(i=>i&&{name:i.name,count:i.count})});
let issue=null,made=0,trace=[],lost=false;const die=()=>{lost=true;bot.clearControlStates()};for(const ev of['death','respawn','end'])bot.on(ev,die);
function check(){if(lost||bot.entity!==self||bot.game.dimension!=='overworld'||bot.health<7||Date.now()-start>35000||Date.now()>deadline-5000)throw Error('LIFE_TIME')}
async function settleCursor(){check();const w=bot.inventory;if(bot.currentWindow)throw Error('UNEXPECTED_WINDOW');if(!w.selectedItem)return;const held={name:w.selectedItem.name,count:w.selectedItem.count};const slot=Array.from({length:w.inventoryEnd-w.inventoryStart},(_,n)=>n+w.inventoryStart).find(n=>!w.slots[n]);if(slot===undefined)throw Error('CURSOR_SPACE_REQUIRED');await bot.clickWindow(slot,0,0);await bot.waitForTicks(4);check();if(w.selectedItem)throw Error('CURSOR_RETAINED');trace.push(['ACTUAL_CURSOR_RECOVERY',held,slot])}
async function craft(n){check();if(bot.inventory.slots.slice(0,5).some(Boolean))throw Error('GRID_MUST_START_EMPTY');const r=bot.recipesFor(bot.registry.itemsByName[n].id,null,1,null)[0];if(!r)throw Error('RECIPE_'+n);await bot.craft(r,1,null);await bot.waitForTicks(10);check();await settleCursor();if(bot.inventory.slots.slice(0,5).some(Boolean))throw Error('GRID_RETAINED');}
try{
check();if(!bot.entity.position.floored().equals(new Vec3(134,-36,2276)))throw Error('STAGE');if(bot.currentWindow||bot.inventory.selectedItem)throw Error('CLEAN_INVENTORY_REQUIRED');
const frames=bot.findBlocks({matching:bot.registry.blocksByName.end_portal_frame.id,maxDistance:8,count:20});if(frames.length!==12)throw Error('FRAME_COUNT');const remaining=frames.filter(q=>bot.blockAt(q).getProperties().eye===false).length,limit=global.P1CraftOne?Math.min(1,remaining):remaining;
const want=Math.max(0,limit-count('ender_eye'));if(count('ender_pearl')<want||count('blaze_powder')+2*count('blaze_rod')<want)throw Error('MATERIAL_REQUIRED_'+want);
while(count('ender_eye')<limit){
 if(!count('blaze_powder')){const r=count('blaze_rod'),p=count('blaze_powder');await craft('blaze_powder');if(count('blaze_rod')!==r-1||count('blaze_powder')!==p+2)throw Error('POWDER_RECEIPT');trace.push(['ACTUAL_POWDER',snap()])}
 const e=count('ender_eye'),p=count('blaze_powder'),pe=count('ender_pearl');await craft('ender_eye');if(count('ender_eye')!==e+1||count('blaze_powder')!==p-1||count('ender_pearl')!==pe-1)throw Error('EYE_RECEIPT');made++;trace.push(['ACTUAL_EYE',snap()]);
}
}catch(e){issue=e.message;trace.push(['ISSUE',issue,snap()])}finally{bot.clearControlStates();for(const ev of['death','respawn','end'])bot.removeListener(ev,die);delete global.P1CraftOne}
return{issue,made,lost,trace,p:bot.entity.position,hp:bot.health,food:bot.food,...snap(),controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

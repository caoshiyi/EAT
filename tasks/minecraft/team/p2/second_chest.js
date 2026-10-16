global.p2craft={name:'spruce_planks',times:2};
const cfg=global.p2craft||{name:'sandstone',times:1};const name=cfg.name,id=bot.registry.itemsByName[name].id;bot.pathfinder.setGoal(null);bot.clearControlStates();const before=bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0);
for(let t=0;t<(cfg.times||1);t++){
let w=bot.inventory,table=null;if(cfg.table){const{Vec3}=require('vec3');table=bot.blockAt(new Vec3(...cfg.table));const opening=new Promise(r=>bot.once('windowOpen',r));await bot.activateBlock(table);w=await opening;}
try{
const sync=async()=>{await bot.waitForTicks(4);if(typeof bot._syncWindow==='function')await bot._syncWindow(w);};await sync();
if(w.selectedItem){const e=w.slots.findIndex((i,s)=>s>=w.inventoryStart&&s<w.inventoryEnd&&!i);await bot.clickWindow(e,0,0);await sync();}
const width=table?3:2;for(let s=1;s<=width*width;s++)if(w.slots[s]){await bot.clickWindow(s,0,1);await sync();}
const recipe=bot.recipesFor(id,null,1,table)[0];if(!recipe)throw Error('no recipe '+name);const entries=[];
if(recipe.inShape)for(let y=0;y<recipe.inShape.length;y++)for(let x=0;x<recipe.inShape[y].length;x++){const i=recipe.inShape[y][x];if(i.id!==-1)entries.push([1+x+y*width,i.id]);}
const used=new Set(entries.map(e=>e[0]));if(recipe.ingredients)for(const i of recipe.ingredients){let s=width*width;while(used.has(s))s--;used.add(s);entries.push([s,i.id]);}
for(const [dest,type]of entries){const src=w.slots.findIndex((i,s)=>s>=w.inventoryStart&&s<w.inventoryEnd&&i?.type===type);if(src<0)throw Error('missing ingredient '+type);await bot.clickWindow(src,0,0);await sync();await bot.clickWindow(dest,1,0);await sync();if(w.selectedItem){await bot.clickWindow(src,0,0);await sync();}}
console.log('computed output',w.slots[0]?.name,w.slots[0]?.count);if(w.slots[0]?.type!==id)throw Error('server recipe output mismatch');await bot.clickWindow(0,0,1);await sync();
}finally{if(table){await bot.closeWindow(w);await bot.waitForTicks(4);}}
}
const after=bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0);console.log('CRAFT VERIFIED',name,'before',before,'after',after,'inventory',bot.inventory.items().map(i=>[i.name,i.count]));if(after<=before)throw Error('output not acquired');

global.p2craft=undefined;const{Vec3}=require('vec3');const table=bot.blockAt(new Vec3(6,66,82));const r=bot.recipesFor(bot.registry.itemsByName.chest.id,null,1,table)[0];if(!r)throw Error('nochestrecipe');await bot.craft(r,1,table);await bot.waitForTicks(8);const chest=bot.inventory.items().find(i=>i.name==='chest');if(!chest)throw Error('noactualchest');await bot.equip(chest,'hand');bot.setControlState('sneak',true);await bot.waitForTicks(4);try{await bot.placeBlock(bot.blockAt(new Vec3(7,67,82)),new Vec3(0,1,0));}finally{bot.setControlState('sneak',false);}await bot.waitForTicks(6);console.log('UPPERBLOCK',bot.blockAt(new Vec3(7,68,82)).name);for(const y of[67,68]){const c=await bot.openChest(bot.blockAt(new Vec3(7,y,82)));console.log('OPENVERIFIED',y,'slots',c.inventoryStart,'contents',c.containerItems().map(i=>[i.name,i.count]));c.close();await bot.waitForTicks(4);}console.log('FINALBODY',bot.entity.position.toString(),bot.health,bot.food);

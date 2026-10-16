const{Vec3}=require('vec3');if(bot.game.dimension!=='overworld'||bot.entity.position.z<82.2||bot.health<18)throw Error('notcamp');bot.deactivateItem();const c=await bot.openContainer(bot.blockAt(new Vec3(7,67,82)));try{for(const[n,k]of[['spruce_log',1],['cobblestone',3]]){const i=c.containerItems().find(i=>i.name===n);if(!i||i.count<k)throw Error('materialabsent '+n);await c.withdraw(i.type,null,k);await bot.waitForTicks(3)}}finally{c.close()}
{global.p4craft={name:'spruce_planks',times:1};
const cfg=global.p4craft||{name:'stick',times:1};const name=cfg.name,id=bot.registry.itemsByName[name].id;bot.pathfinder.setGoal(null);bot.clearControlStates();const before=bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0);
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

}
{global.p4craft={name:'stick',times:1};
const cfg=global.p4craft||{name:'stick',times:1};const name=cfg.name,id=bot.registry.itemsByName[name].id;bot.pathfinder.setGoal(null);bot.clearControlStates();const before=bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0);
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

}
{global.p4craft={name:'stone_pickaxe',times:1,table:[6,66,82]};
const cfg=global.p4craft||{name:'stick',times:1};const name=cfg.name,id=bot.registry.itemsByName[name].id;bot.pathfinder.setGoal(null);bot.clearControlStates();const before=bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0);
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

}
const d=await bot.openContainer(bot.blockAt(new Vec3(7,67,82)));try{for(const name of['spruce_planks','stick','wooden_pickaxe']){for(const i of bot.inventory.items().filter(i=>i.name===name)){await d.deposit(i.type,null,i.count);await bot.waitForTicks(3)}}console.log('ACTUAL_BANK',d.containerItems().map(i=>[i.name,i.count]));}finally{d.close()}console.log('OWN_KIT',bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),'hp',bot.health,'food',bot.food,'offhand',bot.inventory.slots[45]?.name);await bot.equip(bot.inventory.items().find(i=>i.name==='stone_axe'),'hand');

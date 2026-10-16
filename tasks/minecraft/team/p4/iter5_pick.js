global.p4Craft5=async function(itemName,times=1,tablePos=null){
const cfg={name:itemName,times,table:tablePos};const name=cfg.name,id=bot.registry.itemsByName[name].id;bot.pathfinder.setGoal(null);bot.clearControlStates();const before=bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0);
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

};

const {Vec3}=require('vec3');if(bot.game.dimension!=='overworld'||bot.health<19||bot.entity.position.distanceTo(new Vec3(7.5,67.56,83.5))>1.5)throw Error('START');
console.log('STARTINV',bot.inventory.items().map(i=>[i.name,i.count]));console.log('TABLE',bot.blockAt(new Vec3(6,66,82))?.name);if(bot.blockAt(new Vec3(6,66,82))?.name!=='crafting_table')throw Error('TABLE');
await global.p4Craft5('spruce_planks',2);await global.p4Craft5('stick',1);await global.p4Craft5('wooden_pickaxe',1,[6,66,82]);
console.log('KIT',bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]));console.log('DAY',bot.time.timeOfDay);console.log('STONE',bot.findBlocks({matching:bot.registry.blocksByName.stone.id,maxDistance:40,count:12}).map(p=>[p.x,p.y,p.z]));console.log('IRON',bot.findBlocks({matching:[bot.registry.blocksByName.iron_ore.id,bot.registry.blocksByName.deepslate_iron_ore.id],maxDistance:64,count:12}).map(p=>[p.x,p.y,p.z]));

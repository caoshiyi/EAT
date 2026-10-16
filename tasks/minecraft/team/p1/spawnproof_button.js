async function p1Craft(cfg){const name=cfg.name,id=bot.registry.itemsByName[name].id;bot.pathfinder.setGoal(null);bot.clearControlStates();const before=bot.inventory.items().filter(i=>i.name===name).reduce((s,i)=>s+i.count,0);
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

const{Vec3}=require('vec3');const q=new Vec3(-49,63,-141);if(bot.game.dimension!=='the_nether'||bot.entity.position.distanceTo(q.offset(.5,0,.5))>.65)throw Error('BODY');bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();console.log('BUTTON_SPEC',bot.registry.blocksByName.polished_blackstone_button.boundingBox);if(bot.registry.blocksByName.polished_blackstone_button.boundingBox!=='empty')throw Error('UNKNOWN_BUTTON_COLLISION');
try{await p1Craft({name:'polished_blackstone'});await p1Craft({name:'polished_blackstone_button'});const b=bot.inventory.items().find(i=>i.name==='polished_blackstone_button');if(!b)throw Error('NO_ACTUAL_BUTTON');await bot.equip(b,'hand');await bot.waitForTicks(6);await bot.placeBlock(bot.blockAt(q.offset(0,-1,0)),new Vec3(0,1,0));await bot.waitForTicks(6);console.log('BUTTON_WORLD_VERIFIED',bot.blockAt(q).name,bot.blockAt(q).getProperties(),bot.entity.position.toString(),bot.health,bot.food);}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);const a=bot.inventory.items().find(i=>i.name==='stone_axe');if(a){await bot.equip(a,'hand');await bot.waitForTicks(4);bot.activateItem(true);}console.log('POST_INV',bot.inventory.items().map(i=>[i.name,i.count]));}

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

const{Vec3}=require('vec3');let died=false;const die=()=>{died=true;bot.pathfinder.setGoal(null);bot.clearControlStates()};bot.on('death',die);const life=()=>{if(died||bot.health<=0||bot.game.dimension!=='the_nether')throw Error('LIFE_DISCONTINUITY')};const full=b=>b?.shapes?.some(s=>s[0]===0&&s[1]===0&&s[2]===0&&s[3]===1&&s[4]===1&&s[5]===1);const q=new Vec3(-29,63,-31),t=q.offset(-1,0,0);let open=false;
try{life();bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();await bot.waitForTicks(4);life();if(bot.entity.position.distanceTo(q.offset(.5,0,.5))>.65)throw Error('wrongbody');
console.log('NORTH_FORWARD_COLUMNS',Array.from({length:17},(_,i)=>{const p=q.offset(0,0,-i-1);return[p.toString(),[-1,0,1,2].map(dy=>bot.blockAt(p.offset(0,dy,0))?.name)]}));
for(const d of[new Vec3(1,0,0),new Vec3(-1,0,0),new Vec3(0,1,0),new Vec3(0,-1,0),new Vec3(0,0,1),new Vec3(0,0,-1)]){const b=bot.blockAt(t.plus(d));if(!b||['lava','fire','soul_fire','sand','gravel'].includes(b.name))throw Error('tablefluidgravity');}
if(bot.blockAt(t).name!=='crafting_table'){const pick=bot.inventory.items().filter(i=>i.name==='stone_pickaxe').sort((a,b)=>a.durabilityUsed-b.durabilityUsed)[0];await bot.equip(pick,'hand');await bot.waitForTicks(4);life();await bot.dig(bot.blockAt(t));open=true;await bot.waitForTicks(8);life();const item=bot.inventory.items().find(i=>i.name==='crafting_table');if(!item)throw Error('notable');await bot.equip(item,'hand');await bot.waitForTicks(6);await bot.placeBlock(bot.blockAt(t.offset(0,-1,0)),new Vec3(0,1,0));await bot.waitForTicks(6);life();}
if(bot.blockAt(t).name!=='crafting_table'||!full(bot.blockAt(t)))throw Error('tablepost');open=false;console.log('TABLE_FULL_WALL_VERIFIED',t.toString());await p1Craft({name:'gold_ingot',table:[t.x,t.y,t.z]});life();console.log('GOLD_ACTUAL',bot.inventory.items().filter(i=>['gold_ingot','gold_nugget'].includes(i.name)).map(i=>[i.name,i.count]));
}finally{try{if(open&&!died){const item=bot.inventory.items().find(i=>['basalt','blackstone','cobblestone'].includes(i.name));if(item&&bot.blockAt(t).name==='air'){await bot.equip(item,'hand');await bot.waitForTicks(4);await bot.placeBlock(bot.blockAt(t.offset(0,-1,0)),new Vec3(0,1,0));await bot.waitForTicks(4);console.log('TABLE_ABORT_WALL_REPAIRED',full(bot.blockAt(t)));}}}finally{bot.removeListener('death',die);bot.pathfinder.setGoal(null);bot.clearControlStates();const a=bot.inventory.items().find(i=>i.name==='stone_axe');if(a){await bot.equip(a,'hand');await bot.waitForTicks(4);bot.activateItem(true);}console.log('POST',bot.entity.position.toString(),bot.health,bot.food,'dead',died);}}

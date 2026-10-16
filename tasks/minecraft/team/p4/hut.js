const {Vec3}=require('vec3');bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);
let c=await bot.openContainer(bot.blockAt(new Vec3(7,67,82)));for(const [name,n]of [['furnace',1],['cobblestone',8]]){const i=c.containerItems().find(i=>i.name===name);if(i)await c.withdraw(i.type,null,Math.min(n,i.count));}c.close();
const dirs=[new Vec3(0,1,0),new Vec3(1,0,0),new Vec3(-1,0,0),new Vec3(0,0,1),new Vec3(0,0,-1),new Vec3(0,-1,0)];
async function put(p,name){if(bot.blockAt(p).boundingBox==='block')return true;const i=bot.inventory.items().find(i=>i.name===name);if(!i)return false;await bot.equip(i,'hand');for(const d of dirs){const b=bot.blockAt(p.minus(d));if(b?.boundingBox==='block'){try{await bot.placeBlock(b,d);return bot.blockAt(p).boundingBox==='block';}catch(e){}}}return false;}
for(let x=5;x<=8;x++)for(let z=81;z<=84;z++)if(bot.blockAt(new Vec3(x,66,z)).boundingBox!=='block')await put(new Vec3(x,66,z),'cobblestone');
let missed=[];
for(let y=67;y<=68;y++)for(let x=5;x<=8;x++)for(let z=81;z<=84;z++){if(x!==5&&x!==8&&z!==81&&z!==84)continue;if(x===7&&z===81)continue;if(!await put(new Vec3(x,y,z),'dirt'))missed.push([x,y,z]);}
for(let x=5;x<=8;x++)for(let z=81;z<=84;z++)if(!await put(new Vec3(x,69,z),'dirt'))missed.push([x,69,z]);
await put(new Vec3(6,67,83),'furnace');console.log('missing',missed,'furnace',bot.blockAt(new Vec3(6,67,83)).name,'health',bot.health,'inventory',bot.inventory.items().map(i=>[i.name,i.count]));
if(bot.blockAt(new Vec3(6,67,83)).name==='furnace'){const f=await bot.openFurnace(bot.blockAt(new Vec3(6,67,83)));const pl=bot.inventory.items().find(i=>i.name==='spruce_planks');if(pl)await f.putFuel(pl.type,null,pl.count);f.close();}
bot.chat('Camp furnace at(6,67,83), fueled3planks. Shelter roof/walls around depot, entrance(7,67,81); verify missingholes from p4 output before relying on full cover. p1 bringpork; p2 axe in chest.');

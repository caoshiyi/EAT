const {Vec3}=require('vec3');
let discontinuity=false;const stop=()=>{discontinuity=true;bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();};
bot.on('death',stop);bot.on('respawn',stop);
const check=()=>{const p=bot.entity.position;if(discontinuity||bot.health<=0||bot.game.dimension!=='overworld'||p.x<6.3||p.x>7.8||p.z<82.3||p.z>84||p.y<67||p.y>=68)throw Error('not current camp body');};
let chest;try{
check();bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();
console.log('BEFORE',bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]),'OFFHAND',bot.inventory.slots[45]?.name);
for(let n=0;n<2&&bot.food<20;n++){check();const berry=bot.inventory.items().find(i=>i.name==='sweet_berries');if(!berry)break;await bot.equip(berry,'hand');await bot.waitForTicks(8);check();let timer;try{await Promise.race([bot.consume(),new Promise((_,r)=>timer=setTimeout(()=>r(Error('eat bound')),4000))]);}finally{clearTimeout(timer);bot.deactivateItem();}await bot.waitForTicks(4);check();console.log('MEAL',bot.food,bot.health);}
chest=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));console.log('LOWER',chest.containerItems().map(i=>[i.name,i.count]));chest.close();chest=null;
console.log('END',bot.health,bot.food,bot.entity.position,'DOORS',[6,7].map(x=>bot.blockAt(new Vec3(x,67,81)).getProperties()));
}finally{if(chest)chest.close();bot.clearControlStates();bot.deactivateItem();bot.removeListener('death',stop);bot.removeListener('respawn',stop);}

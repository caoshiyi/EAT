// Ordinary survival checkpoint test. Sandbox first; never deletes bed/floor.
const V=bot.entity.position.constructor;
const home=new V(6.5,67,82.5);
console.log('SOURCE',new Date().toISOString(),bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));
if(bot.entity.position.distanceTo(home)>.3||bot.health>3)throw Error('source mismatch');
const chest=bot.blockAt(new V(7,68,82));
for(const [p,name] of [[new V(5,68,82),'sand'],[new V(5,67,82),'dirt']]){
 const b=bot.blockAt(p);if(b.name!==name)throw Error('door changed '+b.name);await bot.dig(b);await bot.waitForTicks(8);
}
const c=await bot.openChest(chest);for(const i of bot.inventory.items())await c.deposit(i.type,null,i.count);c.close();await bot.waitForTicks(10);
console.log('STORED',bot.inventory.items().map(i=>[i.name,i.count]),bot.health);
let died=false,respawned=false;const d=()=>{died=true;bot.clearControlStates();console.log('DEATH',new Date().toISOString());};const r=()=>{respawned=true;bot.clearControlStates();console.log('RESPAWN',new Date().toISOString(),bot.entity.position,bot.health,bot.food);};bot.on('death',d);bot.on('respawn',r);
try{
 await bot.lookAt(new V(2.5,68.62,82.5),true);bot.setControlState('jump',true);bot.setControlState('forward',true);
 for(let k=0;k<80&&!died;k++){await bot.waitForTicks(1);if(k===11)bot.setControlState('jump',false);if(k%5===0)console.log('FALL',k,bot.entity.position,bot.health);}
 bot.clearControlStates();for(let k=0;k<80&&!respawned;k++)await bot.waitForTicks(1);await bot.waitForTicks(15);
 console.log('END',JSON.stringify({died,respawned,pos:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count])}));
}finally{bot.clearControlStates();bot.removeListener('death',d);bot.removeListener('respawn',r);}

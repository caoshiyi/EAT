const {Vec3}=require('vec3');
async function passDoor(mode){
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const dp=new Vec3(6,67,81);let d=bot.blockAt(dp);if(!d.name.endsWith('_door'))throw Error('campdoor missing');if(!d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(6)}d=bot.blockAt(dp);const s=d.shapes[0];let x=6.5;if(s&&s[3]<.5)x=6+(s[3]+1)/2;else if(s&&s[0]>.5)x=6+s[0]/2;
 for(let i=0;i<12&&Math.abs(bot.entity.position.x-x)>.045;i++){const p=bot.entity.position;await bot.lookAt(p.offset(Math.sign(x-p.x)*10,1.6,0),true);bot.setControlState('forward',true);await bot.waitForTicks(Math.abs(p.x-x)>.5?4:1);bot.setControlState('forward',false);await bot.waitForTicks(3)}
 await bot.lookAt(mode==='enter'?new Vec3(6.64,bot.entity.position.y+.1,84):bot.entity.position.offset(0,1.6,-12),true);if(mode==='enter')bot.setControlState('jump',true);bot.setControlState('forward',true);
 for(let i=0;i<15;i++){await bot.waitForTicks(3);const p=bot.entity.position;if(mode==='exit'?p.z<79.6:p.z>82.2)break;if(!bot.blockAt(dp).getProperties().open)await bot.activateBlock(bot.blockAt(dp))}bot.clearControlStates();await bot.waitForTicks(4);const p=bot.entity.position;const ok=mode==='exit'?p.z<80:p.z>82.2;if(ok&&bot.blockAt(dp).getProperties().open){await bot.activateBlock(bot.blockAt(dp));await bot.waitForTicks(6)}return{mode,ok,p:bot.entity.position.toString(),hp:bot.health};
}
async function navBound(g,ms=5000){let t;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('bounded nav'))},ms))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates()}}

let died=false;const onDeath=()=>{died=true;bot.pathfinder.setGoal(null);bot.clearControlStates()};bot.on('death',onDeath);const start=Date.now();
const m=new Movements(bot);m.canDig=false;m.allowParkour=false;m.maxDropDown=1;m.scafoldingBlocks=[];m.infiniteLiquidDropdownDistance=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
async function go(x,y,z){if(died)throw Error('new body');await navBound(new goals.GoalNear(x,y,z,1),4500);await bot.waitForTicks(4);console.log('LEG',x,y,z,bot.entity.position.toString(),bot.health);if(died||bot.health<14)throw Error('retreat');return bot.entity.position.distanceTo(new Vec3(x,y,z))<2.5;}
try{
 if(bot.health<18||bot.entity.position.z<82.2||bot.entity.position.z>84)throw Error('bad start');
 console.log('EXIT',await passDoor('exit'));if(bot.entity.position.z>80)throw Error('exit failed');
 if(!await go(7.5,67,87.5))throw Error('buildapproach');
 for(const y of[70,69,68]){if(died||bot.health<14)throw Error('retreat');const b=bot.blockAt(new Vec3(7,y,89));if(b.name==='spruce_planks'){console.log('REMOVEWOOD',y);await bot.dig(b);await bot.waitForTicks(5);}else throw Error('unexpectedstand '+b.name);}
 for(const y of[68,69,70]){await bot.equip(bot.inventory.items().find(i=>i.name==='sandstone'),'hand');const ref=y===68?bot.blockAt(new Vec3(6,68,89)):bot.blockAt(new Vec3(7,y-1,89));await bot.placeBlock(ref,y===68?new Vec3(1,0,0):new Vec3(0,1,0));await bot.waitForTicks(4);console.log('WORLDSTAND',y,bot.blockAt(new Vec3(7,y,89)).name);if(bot.blockAt(new Vec3(7,y,89)).name!=='sandstone')throw Error('notplaced');}
 const q=new Vec3(9,67,88);if(bot.blockAt(q).name==='snow')await bot.dig(bot.blockAt(q));if(bot.blockAt(q).name==='air'){await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');await bot.placeBlock(bot.blockAt(q.offset(0,-1,0)),new Vec3(0,1,0));await bot.waitForTicks(4);}
 console.log('POSTBUILD',[68,69,70].map(y=>bot.blockAt(new Vec3(7,y,89)).name),'GUARD',bot.blockAt(q).name);
} catch(e){console.log('ATTEMPT',e.message)}finally{
 try{if(!died){for(const a of [[7,67,86],[3.5,66,79.5],[6.59,66,79.4]])await go(...a);console.log('ENTRY',await passDoor('enter'));if(bot.entity.position.z>82.2){const c=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));for(const i of bot.inventory.items().filter(i=>i.name==='spruce_planks'))await c.deposit(i.type,null,i.count);console.log('BANKRECLAIMEDWOOD',c.containerItems().filter(i=>i.name==='spruce_planks').map(i=>i.count));c.close();}}}catch(e){console.log('RETURNFAIL',e.message)}
 bot.removeListener('death',onDeath);bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('POST',bot.entity.position.toString(),bot.health,bot.food,'died',died,bot.inventory.items().map(i=>[i.name,i.count]));
}

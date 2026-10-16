const {Vec3}=require('vec3');
async function passDoor(mode){
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const dp=new Vec3(6,67,81);let d=bot.blockAt(dp);if(!d.name.endsWith('_door'))throw Error('campdoor missing');if(!d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(6)}d=bot.blockAt(dp);const s=d.shapes[0];let x=6.5;if(s&&s[3]<.5)x=6+(s[3]+1)/2;else if(s&&s[0]>.5)x=6+s[0]/2;
 for(let i=0;i<12&&Math.abs(bot.entity.position.x-x)>.045;i++){const p=bot.entity.position;await bot.lookAt(p.offset(Math.sign(x-p.x)*10,1.6,0),true);bot.setControlState('forward',true);await bot.waitForTicks(Math.abs(p.x-x)>.5?4:1);bot.setControlState('forward',false);await bot.waitForTicks(3)}
 await bot.lookAt(mode==='enter'?new Vec3(6.64,bot.entity.position.y+.1,84):bot.entity.position.offset(0,1.6,-12),true);if(mode==='enter')bot.setControlState('jump',true);bot.setControlState('forward',true);
 for(let i=0;i<15;i++){await bot.waitForTicks(3);const p=bot.entity.position;if(mode==='exit'?p.z<79.6:p.z>82.2)break;if(!bot.blockAt(dp).getProperties().open)await bot.activateBlock(bot.blockAt(dp))}bot.clearControlStates();await bot.waitForTicks(4);const p=bot.entity.position;const ok=mode==='exit'?p.z<80:p.z>82.2;if(ok&&bot.blockAt(dp).getProperties().open){await bot.activateBlock(bot.blockAt(dp));await bot.waitForTicks(6)}return{mode,ok,p:bot.entity.position.toString(),hp:bot.health};
}
async function navBound(g,ms=5000){let t;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('bounded nav'))},ms))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates()}}

let died=false;const onDeath=()=>{died=true;bot.pathfinder.setGoal(null);bot.clearControlStates()};bot.on('death',onDeath);const start=Date.now();
const m=new Movements(bot);m.canDig=false;m.allowParkour=false;m.maxDropDown=2;m.scafoldingBlocks=[];m.infiniteLiquidDropdownDistance=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
async function go(x,y,z){if(died)throw Error('new body');await navBound(new goals.GoalNear(x,y,z,1),4500);await bot.waitForTicks(4);console.log('LEG',x,y,z,bot.entity.position.toString(),bot.health);if(died||bot.health<14)throw Error('retreat');return bot.entity.position.distanceTo(new Vec3(x,y,z))<2.5;}
try{
 if(bot.health<18||bot.entity.position.z<82.2||bot.entity.position.z>84)throw Error('bad start');
 console.log('EXIT',await passDoor('exit'));if(bot.entity.position.z>80)throw Error('exit failed');
 for(const a of[[7.5,67,87.5],[9.5,68,88.5],[10.5,68,89.5]]){if(Object.values(bot.entities).some(e=>e.type==='hostile'&&e.position.distanceTo(bot.entity.position)<8&&e.position.y>64))throw Error('hostile nearby');if(!await go(...a))throw Error('deckarrival');}
 console.log('CAPTURESTANCE',bot.entity.position.toString(),bot.entity.onGround,bot.health);
 for(const a of [[13,66,90],[14,66,90]]){const p=new Vec3(...a),eye=bot.entity.position.offset(0,1.62,0),v=p.offset(.5,.9,.5).minus(eye),len=v.norm(),hit=bot.world.raycast(eye,v.scaled(1/len),len);console.log('BUCKETRAY',a,bot.blockAt(p).name,bot.blockAt(p).getProperties(),len,hit?.position?.toString(),hit?.name);}
 for(const a of [[9.5,68,88.5],[8.5,67,87.5]])if(!await go(...a))throw Error('deckreturn');
} catch(e){console.log('ATTEMPT',e.message)}finally{
 try{if(!died){for(const a of [[7,67,86],[3.5,66,79.5],[6.59,66,79.4]])await go(...a);console.log('ENTRY',await passDoor('enter'));if(bot.entity.position.z>82.2){const c=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));for(const i of bot.inventory.items().filter(i=>i.name==='spruce_log'))await c.deposit(i.type,null,i.count);console.log('BANKLOGS',c.containerItems().filter(i=>i.name==='spruce_log').map(i=>i.count));c.close();}}}catch(e){console.log('RETURNFAIL',e.message)}
 bot.removeListener('death',onDeath);bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('POST',bot.entity.position.toString(),bot.health,bot.food,'died',died,bot.inventory.items().map(i=>[i.name,i.count]));
}

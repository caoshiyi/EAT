throw Error('HISTORICAL RETIRED: old shared route/front or unsafe return; see P2.md before any adaptation');
const {Vec3}=require('vec3');
async function passDoor(mode){
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const dp=new Vec3(6,67,81);let d=bot.blockAt(dp);if(!d.name.endsWith('_door'))throw Error('campdoor missing');if(!d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(6)}d=bot.blockAt(dp);const s=d.shapes[0];let x=6.5;if(s&&s[3]<.5)x=6+(s[3]+1)/2;else if(s&&s[0]>.5)x=6+s[0]/2;
 for(let i=0;i<12&&Math.abs(bot.entity.position.x-x)>.045;i++){const p=bot.entity.position;await bot.lookAt(p.offset(Math.sign(x-p.x)*10,1.6,0),true);bot.setControlState('forward',true);await bot.waitForTicks(Math.abs(p.x-x)>.5?4:1);bot.setControlState('forward',false);await bot.waitForTicks(3)}
 await bot.lookAt(mode==='enter'?new Vec3(6.64,bot.entity.position.y+.1,84):bot.entity.position.offset(0,1.6,-12),true);bot.setControlState('jump',false);bot.setControlState('forward',true);
 for(let i=0;i<15;i++){await bot.waitForTicks(3);const p=bot.entity.position;if(mode==='exit'?p.z<79.6:p.z>82.2)break;if(!bot.blockAt(dp).getProperties().open)await bot.activateBlock(bot.blockAt(dp))}bot.clearControlStates();await bot.waitForTicks(4);const p=bot.entity.position;const ok=mode==='exit'?p.z<80:p.z>82.2;if(ok&&bot.blockAt(dp).getProperties().open){await bot.activateBlock(bot.blockAt(dp));await bot.waitForTicks(6)}return{mode,ok,p:bot.entity.position.toString(),hp:bot.health};
}
async function navBound(g,ms=5000){let t;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('bounded nav'))},ms))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates()}}

let died=false,retreating=false;const onDeath=()=>{died=true;bot.pathfinder.setGoal(null);bot.clearControlStates()};bot.on('death',onDeath);const start=Date.now();
const m=new Movements(bot);m.canDig=false;m.allowParkour=false;m.maxDropDown=2;m.scafoldingBlocks=[];m.infiniteLiquidDropdownDistance=false;bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1200;
async function go(x,y,z){if(died)throw Error('new body');await navBound(new goals.GoalNear(x,y,z,1),4500);await bot.waitForTicks(4);console.log('LEG',x,y,z,bot.entity.position.toString(),bot.health);if(died||(!retreating&&bot.health<14))throw Error('retreat');return bot.entity.position.distanceTo(new Vec3(x,y,z))<2.5;}
try{
 if(bot.time.timeOfDay>12000)throw Error('notday');if(bot.health<18||bot.entity.position.z<82.2||bot.entity.position.z>84)throw Error('bad start');
 
 const chest=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));const ax=chest.containerItems().find(i=>i.name==='wooden_axe');if(ax)await chest.withdraw(ax.type,null,1);chest.close();await bot.waitForTicks(4);

 console.log('EXIT',await passDoor('exit'));if(bot.entity.position.z>80)throw Error('exit failed');
 for(const a of[[2,67,87],[1.5,66,92.5],[3.5,66,92.5]])await go(...a);
 const t=bot.blockAt(new Vec3(3,66,90));if(t.name==='sand')await bot.dig(t);await go(3.5,66,90.5);
 for(let n=0;n<15;n++){if(died||bot.health<14)throw Error('retreat');if(bot.inventory.items().filter(i=>i.name==='sand').reduce((a,i)=>a+i.count,0)>=12)break;const bs=bot.findBlocks({matching:b=>b.name==='sand',maxDistance:5,count:400}).map(v=>bot.blockAt(v)).filter(b=>b.position.y===66&&b.position.x>=0&&b.position.x<=3&&b.position.z>=86&&b.position.z<=90&&bot.canDigBlock(b)&&!['sand','gravel'].includes(bot.blockAt(b.position.offset(0,1,0)).name)).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position));if(!bs.length)break;await bot.dig(bs[0]);await bot.waitForTicks(5);}
 await bot.waitForTicks(12);for(const e of Object.values(bot.entities).filter(e=>e.name==='item'&&e.getDroppedItem?.()?.name==='sand'&&e.position.distanceTo(bot.entity.position)<5).slice(0,8))await go(e.position.x,e.position.y,e.position.z);
 console.log('SANDACTUAL',bot.inventory.items().filter(i=>i.name==='sand').map(i=>i.count));
 for(const a of[[2,66,96],[2,65,104],[9,65,107]])if(!await go(...a))throw Error('woodroute');
 let fy=null;for(let y=69;y>=61;y--){const f=bot.blockAt(new Vec3(10,y-1,111)),b=bot.blockAt(new Vec3(10,y,111)),h=bot.blockAt(new Vec3(10,y+1,111));if(['grass_block','dirt','sand'].includes(f?.name)&&b?.boundingBox==='empty'&&h?.boundingBox==='empty'){fy=y;break;}}if(fy===null)throw Error('noforestground');await go(10.5,fy,111.5);
 for(let n=0;n<3;n++){if(died||bot.health<14)throw Error('retreat');const bs=bot.findBlocks({matching:b=>b.name==='spruce_log',maxDistance:4.5,count:30}).map(v=>bot.blockAt(v)).filter(b=>b.position.y>=bot.entity.position.y&&bot.canDigBlock(b)).sort((a,b)=>a.position.y-b.position.y);if(!bs.length)break;const axe=bot.inventory.items().find(i=>i.name==='wooden_axe');if(axe)await bot.equip(axe,'hand');await bot.dig(bs[0]);await bot.waitForTicks(12);}
 for(const e of Object.values(bot.entities).filter(e=>e.name==='item'&&e.getDroppedItem?.()?.name==='spruce_log'&&e.position.distanceTo(bot.entity.position)<5&&e.position.y<=bot.entity.position.y+1.5).slice(0,4))await go(e.position.x,e.position.y,e.position.z);
 console.log('LOGACTUAL',bot.inventory.items().filter(i=>i.name==='spruce_log').map(i=>i.count));
} catch(e){console.log('ATTEMPT',e.message)}finally{retreating=true;
 try{if(!died){for(const a of [[15,65,104],[8,65,104],[2,65,104],[2,67,96],[2,67,87],[3.5,66,79.5],[6.59,66,79.4]])await go(...a);console.log('ENTRY',await passDoor('enter'));if(bot.entity.position.z>82.2){const c=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));for(const i of bot.inventory.items().filter(i=>i.name==='wooden_axe'))await c.deposit(i.type,null,i.count);console.log('BUILDRESOURCES',bot.inventory.items().map(i=>[i.name,i.count]));c.close();}}}catch(e){console.log('RETURNFAIL',e.message)}
 bot.removeListener('death',onDeath);bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('POST',bot.entity.position.toString(),bot.health,bot.food,'died',died,bot.inventory.items().map(i=>[i.name,i.count]));
}

const {Vec3}=require('vec3');
async function p1Door(mode){
 bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);const dp=new Vec3(6,67,81);let d=bot.blockAt(dp);if(!d.name.endsWith('_door'))throw Error('campdoor missing');if(!d.getProperties().open){await bot.activateBlock(d);await bot.waitForTicks(6)}d=bot.blockAt(dp);const s=d.shapes[0];let x=6.5;if(s&&s[3]<.5)x=6+(s[3]+1)/2;else if(s&&s[0]>.5)x=6+s[0]/2;
 for(let i=0;i<12&&Math.abs(bot.entity.position.x-x)>.045;i++){const p=bot.entity.position;await bot.lookAt(p.offset(Math.sign(x-p.x)*10,1.6,0),true);bot.setControlState('forward',true);await bot.waitForTicks(Math.abs(p.x-x)>.5?4:1);bot.setControlState('forward',false);await bot.waitForTicks(3)}
 await bot.lookAt(mode==='enter'?new Vec3(6.64,bot.entity.position.y+.1,84):bot.entity.position.offset(0,1.6,-12),true);if(mode==='enter')bot.setControlState('jump',true);bot.setControlState('forward',true);
 for(let i=0;i<15;i++){await bot.waitForTicks(3);const p=bot.entity.position;if(mode==='exit'?p.z<79.6:p.z>82.2)break;if(!bot.blockAt(dp).getProperties().open)await bot.activateBlock(bot.blockAt(dp))}bot.clearControlStates();await bot.waitForTicks(4);const p=bot.entity.position;const ok=mode==='exit'?p.z<80:p.z>82.2;if(ok&&bot.blockAt(dp).getProperties().open){await bot.activateBlock(bot.blockAt(dp));await bot.waitForTicks(6)}return{mode,ok,p:bot.entity.position.toString(),hp:bot.health};
}
async function p1Go(g,ms=5000){let t;try{await Promise.race([bot.pathfinder.goto(g),new Promise((_,r)=>t=setTimeout(()=>{bot.pathfinder.setGoal(null);r(Error('bounded nav'))},ms))])}catch(e){console.log(e.message)}finally{clearTimeout(t);bot.pathfinder.setGoal(null);bot.clearControlStates()}}

console.log(await p1Door('exit'));console.log(await p1Door('enter'));

bot.pathfinder.setGoal(null);bot.clearControlStates();const start=bot.entity.position.clone();const target={x:135,z:65};let broken=0;
for(let k=0;k<16;k++){
 const p=bot.entity.position.clone();const dx=target.x-p.x,dz=target.z-p.z,n=Math.hypot(dx,dz);if(n<3)break;
 await bot.lookAt(p.offset(dx,0.2,dz));bot.setControlState('jump',true);bot.setControlState('forward',true);await bot.waitForTicks(12);bot.clearControlStates();
 if(Math.hypot(bot.entity.position.x-p.x,bot.entity.position.z-p.z)<0.5&&broken<18){
 const q=bot.entity.position;const ahead=q.offset(dx/n*0.9,0,dz/n*0.9);
 for(const h of [1,0])for(const step of [[0,Math.sign(dz)]]){const b=bot.blockAt(q.floored().offset(step[0],h,step[1]));if(b?.boundingBox==='block'&&bot.canDigBlock(b)&&!['chest','bedrock','crafting_table','furnace'].includes(b.name)){const pick=bot.inventory.items().find(i=>i.name==='iron_pickaxe');if(pick)await bot.equip(pick,'hand');console.log('dig',b.name,b.position.toString());await bot.dig(b);broken++;}}
 }
 if(bot.health<6)break;
}
bot.clearControlStates();console.log('overland',start.toString(),bot.entity.position.toString(),'hp',bot.health,'food',bot.food,'feet',bot.blockAt(bot.entity.position).name,'under',bot.blockAt(bot.entity.position.offset(0,-1,0)).name);console.log('pigs',Object.values(bot.entities).filter(e=>e.name==='pig'&&e.position.distanceTo(bot.entity.position)<30).map(e=>[e.id,e.position.toString()]));

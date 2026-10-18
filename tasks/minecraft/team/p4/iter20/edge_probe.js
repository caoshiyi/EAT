const V=require('vec3').Vec3;const hp=bot.health;const trail=[];let issue=null;let placed=false;
const stand=new V(132,-37,2272),gap=new V(133,-37,2272);
try{
 if(bot.game.dimension!=='overworld'||bot.blockAt(stand).name!=='basalt'||bot.blockAt(gap).boundingBox!=='empty')throw Error('preflight');
 for(const goal of [132.80,133.05,133.23]){
 let start=Date.now();bot.setControlState('sneak',true);
 for(let i=0;i<35;i++){
 const p=bot.entity.position;if(bot.health<hp||p.y<-36.1)throw Error('hurt/fall');if(Math.abs(p.x-goal)<.035)break;
 await bot.lookAt(new V(goal,p.y+1.62,2272.5),true);bot.setControlState('forward',true);await bot.waitForTicks(1);
 }
 bot.clearControlStates();bot.setControlState('sneak',true);await bot.waitForTicks(2);
 const p=bot.entity.position.clone();await bot.lookAt(new V(133,-36.45,2272.63),true);await bot.waitForTicks(2);const hit=bot.blockAtCursor(4.5);
 const r={goal,pos:p,elapsed:Date.now()-start,hp:bot.health,ground:bot.entity.onGround,hit:hit&&{p:hit.position,n:hit.name,face:hit.face,intersect:hit.intersect}};trail.push(r);console.log('EDGE',JSON.stringify(r));
 if(p.x>133.0&&hit&&hit.position.equals(stand)&&hit.face===5){
 const before=bot.inventory.items().filter(i=>i.name==='oak_planks').reduce((s,i)=>s+i.count,0);await bot.equip(bot.inventory.items().find(i=>i.name==='oak_planks'),'hand');await bot.placeBlock(bot.blockAt(stand),new V(1,0,0));await bot.waitForTicks(3);
 const after=bot.inventory.items().filter(i=>i.name==='oak_planks').reduce((s,i)=>s+i.count,0);placed=bot.blockAt(gap).name==='oak_planks';console.log('PHYSICAL',JSON.stringify({gap:bot.blockAt(gap).name,before,after,hp:bot.health}));break;
 }
 }
}catch(e){issue=String(e);}finally{
 bot.clearControlStates();bot.setControlState('sneak',true);
 for(let i=0;i<60&&bot.entity.position.y>-36.1&&bot.entity.position.x>132.56;i++){await bot.lookAt(new V(132.5,-34.38,2272.5),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}
 bot.clearControlStates();await bot.waitForTicks(3);
}
return {trail,placed,issue,pos:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count}))};

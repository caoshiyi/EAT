const names=['basalt','cobbled_deepslate'];
bot.clearControlStates();bot.pathfinder.setGoal(null);
const p=bot.entity.position.clone(),hp=bot.health,dim=bot.game.dimension,life=bot.entity;
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0);
const before=Object.fromEntries(names.map(n=>[n,count(n)]));let issue=null,peerObserved=null;const issues=[];
try{
 if(Date.now()>1792273080000)throw Error('OFFER_EXPIRED_2138');
 const peer=Object.values(bot.entities).find(e=>e.username==='p4');
 if(!peer||peer.position.distanceTo(p)>3||names.some(n=>before[n]<1))throw Error('CURRENT_PEER_OR_STOCK');
 peerObserved=peer.position.clone();
 for(const name of names){
  if(bot.entity!==life||bot.health<hp||bot.game.dimension!==dim)throw Error('LIFE_CHANGED');
  const current=Object.values(bot.entities).find(e=>e.username==='p4');
  if(!current||current.position.distanceTo(bot.entity.position)>3)throw Error('PEER_MOVED');
  const item=bot.inventory.items().find(i=>i.name===name);
  await bot.lookAt(current.position.offset(0,1,0),true);
  await bot.toss(item.type,null,1);issues.push({name,at:new Date().toISOString(),donorCount:count(name)});
 }
 await bot.waitForTicks(5);
}catch(e){issue=e.message}finally{bot.clearControlStates();bot.pathfinder.setGoal(null)}
return{at:new Date().toISOString(),beneficiary:'p4',purpose:'two named ownclosing reserve for P1 current tool unit',peerObserved,before,after:Object.fromEntries(names.map(n=>[n,count(n)])),issues,issue,positionRetained:bot.entity.position.distanceTo(p)<.1,healthRetained:bot.health>=hp,dimensionRetained:bot.game.dimension===dim,pos:bot.entity.position,hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState,goal:bot.pathfinder.goal,cursor:bot.inventory.selectedItem,window:bot.currentWindow?.type||null};

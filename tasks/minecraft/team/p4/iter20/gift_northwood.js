const V=require('vec3').Vec3,m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);
try{await bot.pathfinder.goto(new goals.GoalBlock(139,-36,2231));}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}
let until=Date.now()+12000,p;
while(Date.now()<until){p=bot.players.p1&&bot.players.p1.entity;if(p&&p.position.distanceTo(bot.entity.position)<1.6&&Math.abs(p.position.y+36)<.2)break;await bot.waitForTicks(2);}
if(!p||p.position.distanceTo(bot.entity.position)>=1.6)return {refused:'recipient not co-present',p:p&&p.position};
const item=bot.inventory.items().find(i=>i.name==='oak_planks');if(!item)return {refused:'no wood'};
console.log('GIFT_PRE',JSON.stringify({donor:bot.entity.position,p1:p.position,n:item.count,otherPlayers:Object.values(bot.entities).filter(e=>e.type==='player').map(e=>({n:e.username,p:e.position}))}));
await bot.lookAt(p.position.offset(.05,.6,.05),true);await bot.tossStack(item);
try{for(let i=0;i<40&&bot.entity.position.x>138.58;i++){await bot.lookAt(new V(138.5,-34.38,2231.5),true);bot.setControlState('sneak',true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}finally{bot.clearControlStates();}
await bot.waitForTicks(55);return {donorWood:bot.inventory.items().filter(i=>i.name==='oak_planks').reduce((s,i)=>s+i.count,0),p:bot.entity.position,hp:bot.health,recipient:p.position};

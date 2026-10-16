const {Vec3}=require('vec3');
bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();
const life=bot.entity.id,health=bot.health,started=Date.now(),counts=()=>Object.fromEntries(['stone_pickaxe','diorite','cobblestone','sweet_berries','rotten_flesh'].map(n=>[n,bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0)]));
let dead=false;const die=()=>{dead=true;bot.clearControlStates()},collect=(actor,item)=>console.log('COLLECT',actor.username||actor.name,actor.id,item.id,item.position);bot.on('death',die);bot.on('playerCollect',collect);
const inside=e=>e&&e.position.y>=62.9&&e.position.y<64&&e.position.x>=40&&e.position.x<42&&e.position.z>=102&&e.position.z<103;
function guard(){if(dead||bot.entity.id!==life||bot.health<8)throw Error('LIFE');if(!bot.entity.position.floored().equals(new Vec3(42,63,102)))throw Error('DONOR_POSITION')}
async function tick(n){await bot.waitForTicks(n);guard()}
try{
guard();console.log('BEFORE',counts(),bot.entity.position,bot.health);let p;
while(Date.now()-started<90000){p=bot.players.p1?.entity;if(inside(p))break;await tick(10)}
if(!inside(p))throw Error('NO_ACTUAL_RECEIVER_90SEC');
console.log('RECEIVER_ACTUAL',p.id,p.position);
await bot.lookAt(new Vec3(43,64.4,102.5),true);
bot.setControlState('sneak',true);bot.setControlState('forward',true);await tick(6);bot.clearControlStates();await tick(3);
console.log('DONOR_EDGE',bot.entity.position);
const pick=bot.inventory.items().find(i=>i.name==='stone_pickaxe'&&i.durabilityUsed===56);
if(!pick||counts().diorite!==2||counts().cobblestone!==3)throw Error('EXACT_GIFT_STOCK');
for(const [n,item,amount] of [['pick',pick,1],['diorite',bot.inventory.items().find(i=>i.name==='diorite'),2],['cobble',bot.inventory.items().find(i=>i.name==='cobblestone'),3]]){
p=bot.players.p1?.entity;if(!inside(p))throw Error('RECEIVER_LEFT');
await bot.lookAt(new Vec3(40.5,63.2,102.5),true);await tick(6);
if(n==='pick')await bot.tossStack(item);else await bot.toss(item.type,null,amount);
console.log('GIFT_TOSSED',n,counts());await tick(20);
}
const stop=Date.now()+40000;
while(Date.now()<stop&&counts().sweet_berries+counts().rotten_flesh<3)await tick(10);
console.log('FOOD_ACTUAL',counts());
console.log('WORLD_ITEMS',Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<5).map(e=>[e.id,e.position,e.metadata]));
console.log('OTHER_BODY',bot.players.p1?.entity?.position);
}catch(e){console.log('ISSUE',e.message)}
finally{bot.pathfinder.setGoal(null);bot.clearControlStates();bot.deactivateItem();bot.removeListener('death',die);bot.removeListener('playerCollect',collect);console.log('FINAL',bot.entity.position,bot.health,bot.food,counts(),'SAME',!dead&&bot.entity.id===life,'KIT',bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]));}

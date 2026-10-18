const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];m.maxDropDown=1;for(const n of['water','lava','sweet_berry_bush','powder_snow'])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);
const full=p=>bot.blockAt(p)?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');const berries=()=>bot.inventory.items().find(i=>i.name==='sweet_berries');
try{for(let cycle=0;cycle<8;cycle++){
 if(bot.food<19&&berries()){await bot.equip(berries(),'hand');await bot.consume();await bot.waitForTicks(2);console.log('EAT',bot.health,bot.food,berries()?.count);}
 await bot.unequip('hand');
 for(const p of bot.findBlocks({matching:bot.registry.blocksByName.sweet_berry_bush.id,maxDistance:4,count:16})){let b=bot.blockAt(p);if(!bot.canSeeBlock(b)||p.distanceTo(bot.entity.position)>4)continue;if(Number(b.getProperties().age)>=2){await bot.activateBlock(b);await bot.waitForTicks(3);console.log('HARVEST',p);}b=bot.blockAt(p);if(b?.name==='sweet_berry_bush'&&bot.canSeeBlock(b)){await bot.dig(b,false,'raycast');console.log('CLEAR',p);}}
 const items=Object.values(bot.entities).filter(e=>e.name==='item'&&e.metadata[8]?.itemId===bot.registry.itemsByName.sweet_berries.id&&e.position.distanceTo(bot.entity.position)<12).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position));
 let target=items.map(e=>e.position.floored()).find(p=>full(p.offset(0,-1,0))&&['air','snow'].includes(bot.blockAt(p)?.name)&&['air','snow'].includes(bot.blockAt(p.offset(0,1,0))?.name)&&![[-1,0],[1,0],[0,-1],[0,1]].some(([x,z])=>bot.blockAt(p.offset(x,0,z))?.name==='sweet_berry_bush'));
 if(!target){console.log('NO_SAFE_ITEM_TARGET');break;}
 console.log('TARGET',target);await bot.pathfinder.goto(new goals.GoalBlock(target.x,target.y,target.z));await bot.waitForTicks(15);console.log('RECEIPT',bot.entity.position,bot.health,bot.food,berries()?.count);if((berries()?.count||0)>=22)break;
 }}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();console.log('END',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));}

global.p3fluid={x:18,y:62,z:-18,name:'water'};
// Set global.p3fluid={x,y,z,name:'water'|'lava'}; stand safely <=4.5 blocks from source.
const {Vec3}=require('vec3');const c=global.p3fluid;if(!c)throw Error('global.p3fluid required');const p=new Vec3(c.x,c.y,c.z);bot.pathfinder.setGoal(null);bot.clearControlStates();
const b=bot.blockAt(p);console.log('before',b?.name,b?.getProperties());if(b?.name!==c.name||Number(b.getProperties().level)!==0)throw Error('need source fluid');if(bot.entity.position.distanceTo(p)>5)throw Error('source too far');
const bucket=bot.inventory.items().find(i=>i.name==='bucket');if(!bucket)throw Error('empty bucket required');await bot.equip(bucket,'hand');await bot.lookAt(p.offset(.5,.5,.5),true);bot.activateItem();await bot.waitForTicks(10);bot.deactivateItem();
console.log('after',bot.blockAt(p)?.name,bot.blockAt(p)?.getProperties());return {p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

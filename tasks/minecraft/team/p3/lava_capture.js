global.p3fluid={x:10,y:66,z:90,name:'lava'};
// Set global.p3fluid={x,y,z,name:'water'|'lava'}; stand safely <=4.5 blocks from source.
const {Vec3}=require('vec3');const c=global.p3fluid;if(!c)throw Error('global.p3fluid required');const p=new Vec3(c.x,c.y,c.z);bot.pathfinder.setGoal(null);bot.clearControlStates();
const b=bot.blockAt(p);console.log('before',b?.name,b?.getProperties());if(b?.name!==c.name||Number(b.getProperties().level)!==0)throw Error('need source fluid');if(bot.entity.position.distanceTo(p)>5)throw Error('source too far');
const bucket=bot.inventory.items().find(i=>i.name==='bucket');if(!bucket)throw Error('empty bucket required');await bot.equip(bucket,'hand');await bot.lookAt(p.offset(.5,.9,.5),true);await bot.waitForTicks(4);bot.activateItem();await bot.waitForTicks(12);bot.deactivateItem();
console.log('after',bot.blockAt(p)?.name,bot.blockAt(p)?.getProperties());return {p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

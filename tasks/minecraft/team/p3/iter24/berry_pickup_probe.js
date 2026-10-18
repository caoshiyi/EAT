await bot.waitForTicks(15);console.log('STATE',bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count]));
console.log('ITEMS',JSON.stringify(Object.values(bot.entities).filter(e=>e.name==='item'&&e.position.distanceTo(bot.entity.position)<8).map(e=>({id:e.id,pos:e.position,d:e.position.distanceTo(bot.entity.position),meta:e.metadata}))));
const{Vec3}=require('vec3');for(let x=8;x<=13;x++)for(let z=-22;z<=-16;z++){let p=new Vec3(x,67,z);console.log('CELL',x,z,[-1,0,1,2].map(y=>({y:y+67,n:bot.blockAt(p.offset(0,y,0))?.name})));}

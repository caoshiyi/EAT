const p=bot.entity.position;console.log('OBSERVATION',new Date().toISOString(),p,bot.health);
console.log('ANIMALS',JSON.stringify(Object.values(bot.entities).filter(e=>['chicken','cow','pig','sheep','skeleton'].includes(e.name)).map(e=>({id:e.id,n:e.name,p:e.position,d:p.distanceTo(e.position)}))));
for(const name of ['spruce_log','gravel'])console.log('NATIVE',name,JSON.stringify(bot.findBlocks({matching:bot.registry.blocksByName[name].id,maxDistance:32,count:5}).map(q=>({p:q,n:bot.blockAt(q)?.name,d:p.distanceTo(q)}))));

const lava=bot.findBlocks({matching:bot.registry.blocksByName.lava.id,maxDistance:40,count:300}).map(p=>bot.blockAt(p));
const sources=lava.filter(b=>b.getProperties().level===0||b.getProperties().level==='0');
console.log('lava count',lava.length,'sources',sources.length, 'sample',sources.slice(0,12).map(b=>({p:b.position,properties:b.getProperties(),above:bot.blockAt(b.position.offset(0,1,0))?.name})));
for(const name of ['water','hay_block','bell','chest','sweet_berry_bush','sugar_cane']){const id=bot.registry.blocksByName[name]?.id;if(id)console.log(name,bot.findBlocks({matching:id,maxDistance:80,count:5}));}
console.log('animal',Object.values(bot.entities).filter(e=>['cow','pig','sheep','villager'].includes(e.name)).map(e=>({name:e.name,pos:e.position})));
console.log('local ground',bot.blockAt(bot.entity.position.floored().offset(0,-1,0))?.name);

const {Vec3}=require('vec3');
if(bot.game.dimension!=='overworld'||bot.entity.position.distanceTo(new Vec3(7.4,67.56,83.55))>1.5)throw Error('camp start');
for(const name of['iron_ore','spruce_log'])console.log(name,bot.findBlocks({matching:bot.registry.blocksByName[name].id,maxDistance:64,count:40}).map(p=>[p.x,p.y,p.z]));
console.log('DAY',bot.time.timeOfDay,'doors',[6,7].map(x=>bot.blockAt(new Vec3(x,67,81)).getProperties().open));
const c=await bot.openChest(bot.blockAt(new Vec3(7,67,82)));try{console.log('SUPPLY',c.containerItems().map(i=>[i.name,i.count]));}finally{c.close();}

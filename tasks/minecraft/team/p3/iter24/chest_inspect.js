const {Vec3}=require('vec3');
const b=bot.blockAt(new Vec3(7,68,82));
console.log('CHEST',b?.name,'visible',b&&bot.canSeeBlock(b),'distance',b&&b.position.distanceTo(bot.entity.position));
if(!b||b.name!=='chest'||!bot.canSeeBlock(b)) return 'REFUSE';
let c;try{c=await bot.openChest(b);console.log('CONTENTS',JSON.stringify(c.containerItems().map(i=>({name:i.name,count:i.count,slot:i.slot}))));}finally{if(c)c.close();}

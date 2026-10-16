const{Vec3}=require('vec3');
console.log('BODY',bot.entity.position,bot.health,bot.inventory.items().map(i=>[i.name,i.count]));
for(let x=8;x<=13;x++)for(let z=82;z<=84;z++){console.log('COLUMN',x,z,[63,64,65,66,67,68,69,70].map(y=>{const b=bot.blockAt(new Vec3(x,y,z));return[y,b?.name,b?.boundingBox];}));}
console.log('CAMPDOORS',[6,7].map(x=>bot.blockAt(new Vec3(x,67,81)).getProperties().open));

const {Vec3}=require('vec3');const cols=[];
for(let x=-11;x<=-2;x++){let bs=[];for(let y=49;y<=63;y++){let b=bot.blockAt(new Vec3(x,y,-12));bs.push([y,b?.name]);}cols.push({x,z:-12,blocks:bs});}
let rows=[];for(let k=0;k<100;k++){const d=Object.values(bot.entities).find(e=>e.name==='ender_dragon');if(k%5===0)rows.push({at:new Date().toISOString(),p:d?.position.clone(),width:d?.width,height:d?.height});await bot.waitForTicks(1);}
console.log('SURVEY',JSON.stringify({p:bot.entity.position,hp:bot.health,cols,dragonRows:rows,bossbars:Object.values(bot.bossBars||{}).map(b=>({health:b.health,title:String(b.title)}))}));

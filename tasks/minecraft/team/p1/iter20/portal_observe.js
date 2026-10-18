const V=bot.entity.position.constructor;
for(let y=-39;y<=-34;y++){let a=[];for(let z=2273;z<=2278;z++)for(let x=130;x<=136;x++){let b=bot.blockAt(new V(x,y,z));if(b&&b.name!=='air'&&b.name!=='cave_air')a.push([x,z,b.name]);}console.log(y,JSON.stringify(a));}
console.log('self',JSON.stringify({p:bot.entity.position,hp:bot.health,food:bot.food,items:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])}));

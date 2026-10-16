const {Vec3}=require('vec3');
console.log('STATE',bot.game.dimension,bot.entity.position,bot.health,bot.food,bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]));
const coords=[];for(let z=80;z<=88;z++)for(let x=-2;x<=2;x++)for(let y=41;y<=50;y++){const b=bot.blockAt(new Vec3(x,y,z));if(b&&(/iron_ore|lava|water|gravel|sand$/.test(b.name)))coords.push([x,y,z,b.name]);}
console.log('GEO',JSON.stringify(coords));
console.log('PATH',JSON.stringify([[-1,58,77],[-1,57,77],[-1,56,77],[-1,55,77],[-1,54,77],[-1,53,78],[-1,52,79],[-1,51,80],[-2,50,80],[-2,49,81],[-2,48,82],[-2,47,83],[-2,46,84],[-2,45,85],[-1,44,85],[0,43,85],[1,42,85]].map(q=>[q,[0,1,2,3,-1].map(d=>bot.blockAt(new Vec3(q[0],q[1]+d,q[2]))?.name)])));

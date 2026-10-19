bot.pathfinder.setGoal(null);bot.clearControlStates();
const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z);
const rows=[];for(let z=2;z<=6;z++){const row=[];for(let x=-6;x<=1;x++)row.push([x,[49,50,51,52].map(y=>bot.blockAt(v(x,y,z))?.name||null)]);rows.push([z,row]);}
console.log('HANDOFF_READONLY',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,inv:bot.inventory.items().map(i=>[i.name,i.count]),players:Object.values(bot.players).filter(p=>p.entity).map(p=>[p.username,p.entity.position]),rows}));

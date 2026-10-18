// Read-only loaded local blocks, not a qualified route or interaction.
const V=bot.entity.position.constructor;
console.log('BODY',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,dimension:bot.game.dimension}));
for(let x=6;x<=8;x++)for(let z=82;z<=92;z++) {
const rows=[];for(let y=64;y<=71;y++){const p=new V(x,y,z),b=bot.blockAt(p);rows.push([y,b?.name??'UNLOADED',!!b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')]);}
console.log('COLUMN',JSON.stringify({x,z,rows}));}
console.log('NEAR',JSON.stringify(Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(bot.entity.position)<16).map(e=>({n:e.name,p:e.position,d:e.position.distanceTo(bot.entity.position)}))));
return {readOnly:true,routeQualified:false,at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(n=>[n,bot.getControlState(n)])),goal:!!bot.pathfinder.goal,window:!!bot.currentWindow};

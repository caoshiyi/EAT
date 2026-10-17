const{Vec3}=require("vec3");bot.clearControlStates();bot.pathfinder.setGoal(null);const body=bot.entity,hp=bot.health,V=a=>new Vec3(...a);
const full=a=>bot.blockAt(V(a))?.shapes?.some(s=>s.join(",")==="0,0,0,1,1,1");
const walls=[[5,67,82],[5,68,82],[5,67,83],[5,68,83],[6,67,84],[6,68,84],[7,67,84],[7,68,84],[8,67,83],[8,68,83],[8,69,83],[7,67,81],[7,68,81]];
const roof=[[6,69,82],[7,69,82],[6,69,83],[7,69,83]],door=bot.blockAt(V([6,67,81]));let c;
try{c=await bot.openChest(bot.blockAt(V([7,68,82])));const bank=c.containerItems().map(i=>({name:i.name,count:i.count,wear:i.durabilityUsed??null}));await c.close();c=null;await bot.waitForTicks(2);
 const inside=bot.game.dimension==="overworld"&&bot.entity.position.x>5.5&&bot.entity.position.x<8&&bot.entity.position.z>82.15&&bot.entity.position.z<84&&bot.entity.position.y>=67&&bot.entity.position.y<=67.65;
 const protectedEnd=inside&&bot.entity===body&&bot.health===hp&&walls.every(full)&&roof.every(a=>{const b=bot.blockAt(V(a));return b?.name==="spruce_slab"&&b.getProperties().type==="top"})&&door?.name==="spruce_door"&&door.getProperties().open===false;
 return{at:new Date().toISOString(),protectedEnd,p:bot.entity.position,dim:bot.game.dimension,hp:bot.health,food:bot.food,controls:bot.controlState,own:bot.inventory.items().map(i=>[i.name,i.count]),bank,walls:walls.map(a=>[a,bot.blockAt(V(a))?.name,full(a)]),roof:roof.map(a=>[a,bot.blockAt(V(a))?.name,bot.blockAt(V(a))?.getProperties()]),door:door?.getProperties()};
}finally{if(c)await c.close();bot.clearControlStates();bot.pathfinder.setGoal(null);}

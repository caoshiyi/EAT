const V = require('vec3').Vec3;
bot.pathfinder.setGoal(null); bot.clearControlStates();
function block(x,y,z){const b=bot.blockAt(new V(x,y,z));return {p:[x,y,z],name:b?.name,shapes:b?.shapes};}
console.log(JSON.stringify({position:bot.entity.position,health:bot.health,food:bot.food,ground:bot.entity.onGround,controls:bot.controlState,inventory:bot.inventory.items().map(i=>({name:i.name,count:i.count,wear:i.durabilityUsed})),local:[block(15,49,3),block(15,52,3)],repair:[block(44,64,-3),block(44,65,-3),block(43,66,-3),block(43,66,-2)],boss:Object.values(bot.entities).filter(e=>e.name==='ender_dragon'||e.name==='end_crystal').map(e=>({id:e.id,name:e.name,p:e.position,metadata:e.metadata}))}));

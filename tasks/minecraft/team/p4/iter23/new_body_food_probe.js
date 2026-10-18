const V=require('vec3').Vec3;bot.pathfinder.setGoal(null);bot.clearControlStates();
const found=[];let unknown=0;
for(let x=-5;x<=30;x++)for(let z=-50;z<=5;z++)for(let y=63;y<=77;y++){const p=new V(x,y,z),b=bot.blockAt(p);if(!b){unknown++;continue;}if(['sweet_berry_bush','carrots','potatoes','wheat','melon','pumpkin','brown_mushroom','red_mushroom'].includes(b.name))found.push({p,n:b.name,props:b.getProperties(),support:bot.blockAt(p.offset(0,-1,0))?.name,fromNewP2:p.offset(.5,0,.5).distanceTo(new V(10.5,72,-38.5))});}
console.log('CURRENT_SPAWN_FOOD',JSON.stringify({at:Date.now(),clock:bot.time.timeOfDay,region:{x:[-5,30],z:[-50,5],y:[63,77]},unknown,found:found.sort((a,b)=>a.fromNewP2-b.fromNewP2)}));return{p:bot.entity.position,hp:bot.health,food:bot.food};

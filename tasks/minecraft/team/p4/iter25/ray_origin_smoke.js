bot.clearControlStates();bot.pathfinder.setGoal(null);
const V=bot.entity.position.constructor, eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0);
if(bot.game.dimension!=='overworld'||bot.health!==20||bot.entity.position.floored().toString()!=='(-9, 26, -38)')throw Error('fresh start');
const tests=[];
for(const [name,origin,end] of [
 ['actual_eye_to_north',eye,new V(-8.5,27.62,-42.5)],
 ['solid_north_origin_to_room',new V(-8.5,27.62,-38.5),new V(-8.5,27.62,-37.5)],
 ['solid_north_origin_outward',new V(-8.5,27.62,-38.5),new V(-8.5,27.62,-42.5)],
 ['actual_eye_to_east',eye,new V(-5.5,27.62,-37.5)],
 ['solid_east_origin_to_room',new V(-6.5,27.62,-37.5),new V(-8.5,27.62,-37.5)],
 ['solid_east_origin_outward',new V(-6.5,27.62,-37.5),new V(-4.5,27.62,-37.5)]]){
 const d=end.minus(origin),dist=d.norm(),hit=bot.world.raycast(origin,d.scaled(1/dist),dist-.02);
 tests.push({name,origin,end,originBlock:bot.blockAt(origin.floored())?.name,endpointBlock:bot.blockAt(end.floored())?.name,hit:hit?{p:hit.position,face:hit.face,intersect:hit.intersect}:null});
}
console.log(JSON.stringify({env:'LIVE_ITER25',at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,eye:bot.entity.eyeHeight,tests}));

// LIVE P3 read-only runtime geometry smoke; no interaction/movement.
const V=bot.entity.position.constructor,p=bot.entity.position.clone();
if(bot.game.dimension!=='overworld'||p.distanceTo(new V(6.5,67,82.5))>.05)throw Error('unexpected body');
const samples=[];
for(const [label,root,target] of[
 ['CURRENT_NORTH',p.offset(0,bot.entity.eyeHeight,0),p.offset(0,bot.entity.eyeHeight,-4)],
 ['SOLID_ORIGIN_NORTH',p.offset(0,bot.entity.eyeHeight,-1),p.offset(0,bot.entity.eyeHeight,-4)],
 ['CURRENT_INTERIOR',p.offset(0,bot.entity.eyeHeight,0),p.offset(.2,bot.entity.eyeHeight,0)]
]){const d=target.minus(root),n=d.norm(),hit=bot.world.raycast(root,d.scaled(1/n),n-.001),cell=bot.blockAt(root.floored());samples.push({label,root,originCell:cell?.name,originShapes:cell?.shapes,target,hit:hit?{p:hit.position,face:hit.face,intersect:hit.intersect}:null});}
return {at:new Date().toISOString(),p,hp:bot.health,food:bot.food,MODEL_ONLY:true,samples,flags:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

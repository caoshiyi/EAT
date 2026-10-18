// Read-only geometry calibration; only ordinary crouch and camera movement.
const {Vec3}=require('vec3'),results=[],began=Date.now();
try {for(const crouch of [false,true,false]) {
 bot.clearControlStates();bot.setControlState('sneak',crouch);await bot.waitForTicks(5);
 const p=bot.entity.position.clone(),aim=p.offset(4,1.62,.25);await bot.lookAt(aim,true);await bot.waitForTicks(3);
 const horizontal=Math.hypot(aim.x-p.x,aim.z-p.z),lookEyeOffset=aim.y-Math.tan(bot.entity.pitch)*horizontal-p.y;
 const pose={crouch,control:bot.controlState.sneak,height:bot.entity.height,flag:bot.entity.metadata?.[0],pose:bot.entity.metadata?.[6],p,aim,yaw:bot.entity.yaw,pitch:bot.entity.pitch,lookEyeOffset};
 await bot.lookAt(p.offset(.35,-.015,.25),true);await bot.waitForTicks(3);const h=bot.blockAtCursor(4.5);
 if(h?.intersect){const u=new Vec3(-Math.sin(bot.entity.yaw),0,-Math.cos(bot.entity.yaw)),d=h.intersect.minus(p),along=d.x*u.x+d.z*u.z;pose.floor={p:h.position,face:h.face,hit:h.intersect,yaw:bot.entity.yaw,pitch:bot.entity.pitch,cursorRayEyeOffset:h.intersect.y-Math.tan(bot.entity.pitch)*along-p.y}}else pose.floor=null;
 results.push(pose);
 }}finally{bot.clearControlStates();await bot.waitForTicks(4)}
return{results,elapsed:Date.now()-began,p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count]),controls:bot.controlState};

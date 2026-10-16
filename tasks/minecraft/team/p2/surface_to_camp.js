bot.pathfinder.setGoal(null);bot.clearControlStates();await bot.waitForTicks(4);if(bot.entity.position.y<50)throw Error('Not surface: inspect body before route');
const {Vec3}=require('vec3');const m=new Movements(bot);m.canDig=true;m.maxDropDown=2;m.infiniteLiquidDropdownDistance=false;for(const n of['crafting_table','furnace','chest'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);for(const n of['water','lava'])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
for(let leg=0;leg<6;leg++){
 const p=bot.entity.position.clone();const dx=16-p.x,dz=(p.x<12&&p.z<0)?0:78-p.z,dist=Math.hypot(dx,dz);if(dist<3)break;const x=Math.floor(p.x+dx/dist*Math.min(8,dist)),z=Math.floor(p.z+dz/dist*Math.min(8,dist));let target;
 for(let y=85;y>=55;y--){const b=bot.blockAt(new Vec3(x,y,z));if(b?.boundingBox==='block'&&!/leaves|log/.test(b.name)){const a=bot.blockAt(new Vec3(x,y+1,z));if(a&&a.boundingBox==='empty'&&!/water|lava/.test(a.name)){target=new Vec3(x,y+1,z);break;}}}
 if(!target){console.log('no ground target',x,z);break;}console.log('target',target);
 const timer=setTimeout(()=>bot.pathfinder.setGoal(null),8000);try{await bot.pathfinder.goto(new goals.GoalNear(target.x,target.y,target.z,1.5));}catch(e){console.log('path',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 console.log('leg',leg,bot.entity.position,'floor',bot.blockAt(bot.entity.position.floored().offset(0,-1,0))?.name,'hp',bot.health);if(bot.health<10)break;if(bot.entity.position.distanceTo(p)<1)break;
}
return{p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

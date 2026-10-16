// BOUNDED 120s attack-only guard. Candidate: action counters are diagnostics, not proof of mob damage.
// Does not navigate, aim, equip, block arrows, or handle creepers. Choose own weapon before installing.
if(global.p3guard)clearInterval(global.p3guard);global.p3guardHits=global.p3guardHits||[];
const guardHandle=setInterval(()=>{try{const e=Object.values(bot.entities).filter(e=>['zombie','zombie_villager','skeleton','spider'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<3).sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))[0];if(e){bot.attack(e);global.p3guardHits.push({t:Date.now(),n:e.name,id:e.id,d:e.position.distanceTo(bot.entity.position),hp:bot.health});if(global.p3guardHits.length>40)global.p3guardHits.shift();}}catch(e){console.log('guard error',e.message);}},650);global.p3guard=guardHandle;
setTimeout(()=>{clearInterval(guardHandle);if(global.p3guard===guardHandle)global.p3guard=null;},120000);
const {Vec3}=require('vec3');const m=new Movements(bot);m.canDig=true;m.maxDropDown=3;m.infiniteLiquidDropdownDistance=false;for(const n of['crafting_table','furnace','chest'])m.blocksCantBreak.add(bot.registry.blocksByName[n].id);for(const n of['water','lava'])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);bot.pathfinder.setMovements(m);bot.pathfinder.thinkTimeout=1800;
const travelStart=Date.now();for(let leg=0;leg<6&&Date.now()-travelStart<22000;leg++){
 const p=bot.entity.position.clone();const dx=(p.z<70?16:8)-p.x,dz=90-p.z,dist=Math.hypot(dx,dz);if(dist<3)break;const x=Math.floor(p.x+dx/dist*Math.min(8,dist)),z=Math.floor(p.z+dz/dist*Math.min(8,dist));let target;
 for(const ox of[0,2,4,6,-2,-4,-6]){if(target)break;for(let y=85;y>=55;y--){const b=bot.blockAt(new Vec3(x+ox,y,z));if(b?.boundingBox==='block'&&!/leaves|log/.test(b.name)){const a=bot.blockAt(new Vec3(x+ox,y+1,z));if(a&&a.boundingBox==='empty'&&!/water|lava/.test(a.name)){target=new Vec3(x+ox,y+1,z);break;}}}}
 if(!target){console.log('no ground target',x,z);break;}console.log('target',target);
 const timer=setTimeout(()=>bot.pathfinder.setGoal(null),8000);try{await bot.pathfinder.goto(new goals.GoalNear(target.x,target.y,target.z,1.5));}catch(e){console.log('path',e.message);}finally{clearTimeout(timer);bot.pathfinder.setGoal(null);bot.clearControlStates();}
 console.log('leg',leg,bot.entity.position,'floor',bot.blockAt(bot.entity.position.floored().offset(0,-1,0))?.name,'hp',bot.health);if(bot.health<10)break;if(bot.entity.position.distanceTo(p)<1)break;
}
return{p:bot.entity.position,inv:bot.inventory.items().map(i=>[i.name,i.count])};

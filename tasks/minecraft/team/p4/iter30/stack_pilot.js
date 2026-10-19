const {Vec3}=require('vec3'), t=Date.now(),start=bot.entity.position.clone(),base=start.floored(),hp=bot.health;
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inventory:bot.inventory.items().map(i=>[i.name,i.count]),dim:bot.game.dimension});
const log=(n,v)=>console.log(n,JSON.stringify(v));
function stop(){bot.clearControlStates();bot.pathfinder.setGoal(null);}
function guard(){if(Date.now()-t>45000||bot.health<hp||bot.game.dimension!=='overworld'||Math.hypot(bot.entity.position.x-start.x,bot.entity.position.z-start.z)>.25)throw Error('pilot guard');}
async function face(p){for(const o of [[.5,.01,.5],[.5,.5,.5],[.5,.99,.5]]){await bot.lookAt(p.offset(...o),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(p))return c;}throw Error('no current cursor '+p);}
let raised=0;
try{
stop();if(bot.health!==20||bot.game.dimension!=='overworld'||!base.equals(new Vec3(-1,55,-25))||!bot.entity.onGround)throw Error('actual source mismatch');
log('STACK_SOURCE',snap());
for(let y=57;y<=58;y++){guard();const p=new Vec3(base.x,y,base.z),b=bot.blockAt(p);if(!b)throw Error('unloaded headroom');if(b.boundingBox==='empty')continue;if(!['dirt','grass_block'].includes(b.name))throw Error('nonsoil cap '+b.name);await face(p);await bot.dig(b,true,'raycast');await bot.waitForTicks(2);log('VISIBLE_CAP_CUT',{p,now:bot.blockAt(p)?.name,state:snap()});}
for(let n=0;n<2;n++){
guard();const from=bot.entity.position.y,q=bot.entity.position.floored().offset(0,-1,0),ref=bot.blockAt(q),item=bot.inventory.items().find(i=>i.name==='dirt');if(!ref||ref.boundingBox!=='block'||!item||!bot.entity.onGround)throw Error('stack support/item/ground');
await bot.equip(item,'hand');await bot.lookAt(q.offset(.5,.99,.5),true);await bot.waitForTicks(1);const cur=bot.blockAtCursor(4.5);if(!cur?.position.equals(q))throw Error('support not current visible');
bot.setControlState('jump',true);
for(let k=0;k<12&&bot.entity.position.y-from<1.01;k++){await bot.waitForTicks(1);guard();}
if(bot.entity.position.y-from<1.01)throw Error('jump no height');
await bot.lookAt(q.offset(.5,.99,.5),true);const now=bot.blockAtCursor(4.5);if(!now?.position.equals(q))throw Error('airborne support visibility');
await bot.placeBlock(ref,new Vec3(0,1,0));bot.setControlState('jump',false);
for(let k=0;k<20&&!bot.entity.onGround;k++)await bot.waitForTicks(1);
if(!bot.entity.onGround||Math.abs(bot.entity.position.y-(from+1))>.05||bot.blockAt(q.offset(0,1,0))?.name!=='dirt')throw Error('actual stack postcondition');
raised++;log('NATIVE_STACK_UP',{raised,elapsedMs:Date.now()-t,state:snap()});
}
log('STACK_SURFACE_OBSERVATION',{state:snap(),blocks:bot.findBlocks({matching:b=>['oak_log','birch_log','spruce_log','water','iron_ore','coal_ore'].includes(b.name),maxDistance:24,count:12}),near:Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(bot.entity.position)<12).map(e=>({id:e.id,n:e.name,p:e.position.clone(),d:e.position.distanceTo(bot.entity.position)}))});
}catch(e){log('STACK_FAILURE',{error:String(e),raised,state:snap()});}
finally{
stop();
for(let n=0;n<raised&&bot.health>0;n++){
try{const q=bot.entity.position.floored().offset(0,-1,0),b=bot.blockAt(q);if(b?.name!=='dirt')throw Error('not own soil return');await face(q);await bot.dig(b,true,'raycast');await bot.waitForTicks(10);log('NATIVE_STACK_DOWN',snap());}catch(e){log('RETURN_FAILURE',String(e));break;}
}
stop();log('STACK_END',{raised,elapsedMs:Date.now()-t,state:snap()});
}
return snap();

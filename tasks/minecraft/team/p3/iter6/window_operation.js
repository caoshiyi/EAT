const {Vec3}=require('vec3');
const root=new Vec3(6,65,2),cap=root.offset(-1,1,0),full=b=>b?.boundingBox==='block'&&!/lava|fire|magma_block/.test(b.name);
let lost=false,issue=null;const repairs=[],startDimension=bot.game.dimension,life=()=>{lost=true};bot.on('death',life);bot.on('respawn',life);
function guard(){if(lost||bot.health<12||bot.game.dimension!==startDimension||startDimension!=='the_nether'||!bot.entity.position.floored().equals(root))throw Error('LIFE_OR_BODY_CHANGED');}
async function place(q,ref){guard();if(full(bot.blockAt(q)))return;const item=bot.inventory.items().find(i=>i.name==='cobblestone');if(!item)throw Error('NO_RESERVED_CAP');await bot.equip(item,'hand');await bot._placeBlockWithOptions(bot.blockAt(ref),q.minus(ref),{forceLook:true,swingArm:'right'});await bot.waitForTicks(3);guard();if(!full(bot.blockAt(q)))throw Error('POST_CAP_ABSENT '+q);}
try{
 bot.pathfinder.setGoal(null);bot.clearControlStates();guard();if(bot.inventory.items().find(i=>i.name==='cobblestone')?.count<3)throw Error('RESERVE');
 if(!full(bot.blockAt(cap))||!full(bot.blockAt(cap.offset(0,-1,0))))throw Error('PREFLIGHT_CAP');
 await bot.equip(bot.inventory.items().find(i=>i.name==='stone_pickaxe'),'hand');await bot.dig(bot.blockAt(cap));await bot.waitForTicks(4);guard();console.log('WEST_SURVEY',[-1,-2,-3].map(dx=>[dx,[64,65,66,67].map(y=>bot.blockAt(new Vec3(root.x+dx,y,root.z))?.name)]));
 if(global.p3TestRejectedReference){const q=new Vec3(4,66,2),ref=q.offset(0,-1,0);console.log('OPTIONAL_EXTENSION',q,'REFERENCE',bot.blockAt(ref)?.name);await place(q,ref);}
}catch(e){issue=e.message;console.log('OPERATION_FAILED',issue);}
finally{
 // Each required closure has its own catch. An operation/optional failure cannot skip it.
 for(const q of[cap]){try{guard();await place(q,q.offset(0,-1,0));repairs.push({q,full:full(bot.blockAt(q))});}catch(e){repairs.push({q,error:e.message});}}
 bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',life);bot.removeListener('respawn',life);
}
return{issue,lost,repairs,full:[root.offset(0,-1,0),root.offset(0,2,0),...[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[root.offset(x,0,z),root.offset(x,1,z)])].every(q=>full(bot.blockAt(q))),health:bot.health,food:bot.food,position:bot.entity.position,inventory:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed])};

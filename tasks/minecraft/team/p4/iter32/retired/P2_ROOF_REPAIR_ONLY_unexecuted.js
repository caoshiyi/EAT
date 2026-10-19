// Prepared for objective_owner to run on P2 ONLY. P4 has never run this on P2.
// Source is the observed LIVE12122 ending; changed source refuses without action.
const {Vec3}=require('vec3');
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,inv:bot.inventory.items().map(i=>[i.name,i.count])});
const full=b=>b?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')||false;
const p=bot.entity.position.floored(),roof=p.offset(0,2,0),refp=p.offset(1,2,0),d=new Vec3(-1,0,0);
console.log('CURRENT_SOURCE',JSON.stringify(state()));
if(bot.username!=='p2'||bot.game.dimension!=='overworld'||p.x!==161||p.y!==63||p.z!==311||bot.health<19)throw Error('current P2 source differs; no action');
if(full(bot.blockAt(roof)))return {status:'roof already full; no action',state:state()};
if(bot.blockAt(roof)?.name!=='air'||!full(bot.blockAt(refp)))throw Error('current roof/anchor changed; no action');
const table=bot.inventory.items().find(i=>i.name==='crafting_table');if(!table)throw Error('no actual carried table; no action');
const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),aim=refp.offset(.001,.5,.5),delta=aim.minus(eye),distance=delta.norm();
if(distance>4.4||distance<.01)throw Error('actual reach refusal');
const h=bot.world.raycast(eye,delta.scaled(1/distance),distance+.02);if(!h?.position.equals(refp))throw Error('actual visibility refusal');
await bot.lookAt(aim,true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);
if(!c?.position.equals(refp)||c.face!==4)throw Error('actual cursor/face refusal');
await bot.equip(table,'hand');await bot.placeBlock(bot.blockAt(refp),d);await bot.waitForTicks(5);
const offsets=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
const faces=offsets.map(o=>{const b=bot.blockAt(p.offset(...o));return {p:p.offset(...o),n:b?.name,full:full(b)}});
console.log('ACTUAL_ROOF_EFFECT',JSON.stringify({...state(),roof:bot.blockAt(roof)?.name,faces}));
if(!faces.every(f=>f.full))throw Error('actual ten-boundary check failed');
return {state:state(),faces,limit:'Table is now a fixture. No material pickup, water branch or long travel is established.'};

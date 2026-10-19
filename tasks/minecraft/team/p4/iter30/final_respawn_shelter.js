const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z),start=bot.entity.position.clone(),src=start.floored();
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count])});
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99]]){await bot.lookAt(q.offset(...a),true);await bot.waitForTicks(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return;}throw Error('no actual visible face '+q);}
async function put(q){if(full(q))return;const dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];for(let f=0;f<6;f++){const ref=q.minus(dirs[f]);if(!full(ref))continue;try{await face(ref,f);}catch{continue;}const i=bot.inventory.items().find(i=>i.name==='dirt');if(!i)throw Error('no actual cap');await bot.equip(i,'hand');await bot.placeBlock(bot.blockAt(ref),dirs[f]);await bot.waitForTicks(2);return;}throw Error('no actual capanchor');}
let depth=null;
try{
bot.clearControlStates();bot.pathfinder.setGoal(null);console.log('FRESH_RESPAWN_SOURCE',JSON.stringify(snap()));
if(bot.game.dimension!=='overworld'||bot.health!==20||start.distanceTo(v(6.5,68,-36.5))>.3)throw Error('freshbody changed');
for(const d of[2,3,4]){
const q=src.offset(0,-d,0),walls=[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[q.offset(x,0,z),q.offset(x,1,z)]);
if(walls.every(full)&&full(q.offset(0,-1,0))&&Array.from({length:d},(_,k)=>src.offset(0,-k-1,0)).every(p=>['dirt','grass_block'].includes(bot.blockAt(p)?.name))){depth=d;break;}}
console.log('ACTUAL_SOIL_SHELTER_CHOICE',JSON.stringify({depth,floors:[1,2,3,4,5].map(d=>({d,n:bot.blockAt(src.offset(0,-d,0))?.name}))}));if(!depth)throw Error('no bounded natural enclosure');
for(let k=0;k<depth;k++){const q=bot.entity.position.floored().offset(0,-1,0);await face(q);await bot.unequip('hand');await bot.dig(bot.blockAt(q),true,'raycast');await bot.waitForTicks(8);if(bot.health!==20)throw Error('newbody injured');}
const q=bot.entity.position.floored();bot.setControlState('jump',true);try{for(let k=0;k<10&&bot.entity.position.y<q.y+.65;k++)await bot.waitForTicks(1);await put(q.offset(1,2,0));}finally{bot.setControlState('jump',false);}await bot.waitForTicks(12);await put(q.offset(0,2,0));console.log('ACTUAL_NEW_SHELTER',JSON.stringify(snap()));
}catch(e){console.log('FRESH_SHELTER_FAILURE',String(e));}
finally{bot.clearControlStates();bot.pathfinder.setGoal(null);await bot.waitForTicks(5);const q=bot.entity.position.floored(),faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({p:q.offset(...d),n:bot.blockAt(q.offset(...d))?.name,full:full(q.offset(...d))}));console.log('FRESH_SHELTER_END',JSON.stringify({state:snap(),faces}));}
return snap();

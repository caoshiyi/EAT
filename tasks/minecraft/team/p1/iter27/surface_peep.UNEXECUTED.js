// Sandbox only, P1 only; bounded recipient P2 supply-source assessment.
const V=bot.entity.position.constructor,v=(x,y,z)=>new V(x,y,z),base=v(0,51,-30),hp0=bot.health,body=bot.entity;
let dead=false,escape=false;const g=()=>{if(dead||bot.health<=0||bot.entity!==body||bot.game.dimension!=='overworld')throw Error('life changed');if(!escape&&bot.health<hp0)throw Error('forward HP loss');};
const died=()=>{dead=true;bot.clearControlStates();bot.pathfinder.setGoal(null)};bot.on('death',died);
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),count=()=>bot.inventory.items().filter(i=>i.name==='dirt').reduce((s,i)=>s+i.count,0);
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,day:bot.time?.timeOfDay,dirt:count()});
async function ticks(n){await bot.waitForTicks(n);g()}
async function face(q,point){await bot.lookAt(point,true);g();const c=bot.blockAtCursor(4.5);if(!c?.position.equals(q))throw Error('not actual visible '+q);return c;}
async function cut(q,name){g();const b=bot.blockAt(q);if(b?.name!==name)throw Error('unexpected material '+b?.name);await face(q,q.offset(.5,q.y>=bot.entity.position.y+2?.01:.99,.5));g();await bot.dig(b,false,'raycast');g();await ticks(3);if(!['air','cave_air'].includes(bot.blockAt(q)?.name))throw Error('cut postcondition');}
async function up(){g();const a=bot.entity.position.floored(),ref=a.offset(0,-1,0);if(!full(ref)||!count())throw Error('pillar funding');await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');g();await face(ref,ref.offset(.5,.99,.5));await ticks(2);bot.setControlState('jump',true);try{for(let k=0;k<18&&bot.entity.position.y<a.y+1.025;k++)await ticks(1);if(bot.entity.position.y<a.y+1.025)throw Error('pillar height');await ticks(1);g();await bot.placeBlock(bot.blockAt(ref),v(0,1,0));g();}finally{bot.setControlState('jump',false)}await ticks(10);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03)throw Error('pillar ending');console.log('UP',JSON.stringify(state()));}
async function recap(){const q=base.offset(0,2,0);if(full(q))return;for(const d of[v(1,0,0),v(-1,0,0),v(0,0,1),v(0,0,-1)]){const ref=q.minus(d);if(!full(ref))continue;try{const c=await face(ref,ref.offset(.5,.5,.5));const dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];if(!dirs[c.face]?.equals(d))continue;await bot.equip(bot.inventory.items().find(i=>i.name==='dirt'),'hand');g();await bot.placeBlock(bot.blockAt(ref),d);await ticks(3);if(!full(q))throw Error('recap absent');return;}catch(e){console.log('CAP_ATTEMPT',String(e))}}throw Error('no visible actual cap anchor');}
const offsets=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]];
console.log('SOURCE',JSON.stringify(state()));
try{
 g();if(!bot.entity.position.floored().equals(base)||!bot.entity.onGround||count()!==1||!offsets.every(d=>full(base.offset(...d))))throw Error('source admission');
 if(bot.blockAt(base.offset(0,2,0))?.name!=='grass_block'||![3,4].every(y=>['air','cave_air'].includes(bot.blockAt(base.offset(0,y,0))?.name)))throw Error('surface geometry differs');
 await cut(base.offset(0,2,0),'grass_block');for(let k=0;k<30&&count()<2;k++)await ticks(1);if(count()<2)throw Error('grass drop not collected');
 await up();await up();g();
 const eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),clear=q=>{const delta=q.minus(eye),length=delta.norm();return length>0?bot.world.raycast(eye,delta.scaled(1/length),length):null;};
 const blocks=bot.findBlocks({matching:b=>b.name.endsWith('_log')||b.name==='cobweb'||b.name.endsWith('_bed'),maxDistance:48,count:64}).map(q=>{const hit=clear(q.offset(.5,.5,.5));return{p:q,name:bot.blockAt(q)?.name,visible:!hit||hit.position.equals(q)}});
 const entities=Object.values(bot.entities).filter(e=>e.id!==bot.entity.id&&e.position.distanceTo(bot.entity.position)<48).map(e=>({id:e.id,name:e.name,p:e.position.clone(),height:e.height,visible:!clear(e.position.offset(0,Math.max(.1,(e.height||1)*.5),0))}));
 console.log('SURFACE_NEIGHBORHOOD',JSON.stringify({state:state(),blocks,entities}));
}catch(e){console.log('PRIMARY_FAILURE',String(e),JSON.stringify(state()))}
finally{
 escape=true;bot.clearControlStates();bot.pathfinder.setGoal(null);
 try{g();for(let k=0;k<20&&!bot.entity.onGround;k++)await ticks(1);while(bot.entity.position.y>51.03){g();if(!bot.entity.onGround||bot.entity.position.x<0||bot.entity.position.x>=1||bot.entity.position.z< -30||bot.entity.position.z>=-29)throw Error('escape footprint/ground changed');const q=bot.entity.position.floored().offset(0,-1,0);await cut(q,'dirt');for(let k=0;k<20&&!bot.entity.onGround;k++)await ticks(1);}await recap();for(let j=0;j<3;j++){console.log('TERMINAL',JSON.stringify({state:state(),shell:offsets.map(d=>{const p=base.offset(...d);return{p,name:bot.blockAt(p)?.name,full:!!full(p)}})}));await ticks(3)}}catch(e){console.log('RETENTION_FAILURE',String(e),JSON.stringify(state()))}
 bot.clearControlStates();bot.pathfinder.setGoal(null);bot.removeListener('death',died);
}return state();

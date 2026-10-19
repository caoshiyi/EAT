const V=bot.entity.position.constructor,v=(x,y,z)=>new V(x,y,z),sleep=n=>bot.waitForTicks(n);
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const air=q=>['air','cave_air','void_air'].includes(bot.blockAt(q)?.name);
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),hazards:Object.values(bot.entities).filter(e=>/fireball|cloud/.test(e.name||'')).map(e=>({id:e.id,n:e.name,p:e.position.clone(),width:e.width,height:e.height}))});
const dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];
let died=false;const death=()=>{died=true;bot.clearControlStates();bot.pathfinder.setGoal(null);};bot.on('death',death);
const live=()=>{if(died||bot.health<=0||bot.game.dimension!=='the_end')throw Error('life/dimension changed');};
const rows=[];let prev=bot.health;const health=()=>{if(bot.health<prev)rows.push({event:'healthLoss',before:prev,...snap()});prev=bot.health;};bot.on('health',health);
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99]]){live();await bot.lookAt(q.offset(...a),true);await sleep(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return c;}throw Error('no actual visible face '+q);}
async function cut(q){live();if(air(q))return;const b=bot.blockAt(q),tool=bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(tool)await bot.equip(tool,'hand');else await bot.unequip('hand');const f=await face(q);await bot.dig(bot.blockAt(q),'ignore',dirs[f.face]);await sleep(1);live();if(!air(q))throw Error('dig postcondition '+q);console.log('CUT',q,b.name);}
async function place(q){live();if(full(q))return;for(const f of[1,4,5,2,3,0]){const ref=q.minus(dirs[f]);if(!full(ref))continue;let c;try{c=await face(ref,f);}catch{continue;}const item=bot.inventory.items().find(i=>i.name==='end_stone');if(!item)throw Error('no endstone');await bot.equip(item,'hand');await bot.placeBlock(bot.blockAt(ref),dirs[f]);await sleep(1);if(!full(q))throw Error('place postcondition '+q);return;}throw Error('no visible anchor '+q);}
async function stack(){live();const a=bot.entity.position.floored(),ref=a.offset(0,-1,0);if(!bot.entity.onGround||!full(ref)||!air(a.offset(0,2,0)))throw Error('stack actual source/headroom');await bot.equip(bot.inventory.items().find(i=>i.name==='end_stone'),'hand');await bot.lookAt(ref.offset(.5,1,.5),true);bot.setControlState('jump',true);try{for(let k=0;k<12&&bot.entity.position.y<a.y+1.04;k++)await sleep(1);live();if(bot.entity.position.y<a.y+1.04)throw Error('stack height');const c=bot.blockAtCursor(4.5);if(!c?.position.equals(ref)||c.face!==1)throw Error('stack actual floor cursor');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03);k++)await sleep(1);live();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03||!full(a))throw Error('stack postcondition');console.log('UP',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health}));}
async function down(){live();const q=bot.entity.position.floored();if(!bot.entity.onGround)throw Error('down not grounded');await cut(q.offset(0,-1,0));for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y+1)>.03);k++)await sleep(1);live();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y+1)>.03)throw Error('down postcondition');console.log('DOWN',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health}));}
async function center(x,z){const target=v(x,bot.entity.position.y,z),t=Date.now();try{while(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.045&&Date.now()-t<2500){live();await bot.lookAt(v(x,bot.entity.position.y-2,z),true);bot.setControlState('forward',true);await sleep(1);bot.setControlState('forward',false);await sleep(1);}}finally{bot.clearControlStates();}await sleep(2);if(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.12)throw Error('center postcondition');}
function cleanup(){bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',death);bot.removeListener('health',health);console.log('DAMAGE',JSON.stringify(rows));console.log('POST',JSON.stringify(snap()));}
// Ordinary placement and native walking. rails MUST avoid the solid ascent column.
// Requires wall at x31 beside each rail. No actions beyond current visible client reach.
async function railDrop(q){
 live();const start=bot.entity.position.clone(),a=start.floored();
 if(!bot.entity.onGround||Math.abs(q.x-a.x)+Math.abs(q.z-a.z)!==1||a.y-q.y!==2)throw Error('rail source geometry');
 for(const c of[q,q.offset(0,1,0),q.offset(0,2,0)])if(!air(c))throw Error('rail blocked body '+c);
 // Lean toward destination while retaining original support; current ray decides placement.
 const dx=q.x-a.x,dz=q.z-a.z;
 bot.setControlState('sneak',true);
 try{await center(a.x+.5+dx*.32,a.z+.5+dz*.32);await place(q.offset(0,-1,0));}
 finally{bot.setControlState('sneak',false);}
 const target=q.offset(.5,0,.5),t=Date.now();
 const remaining=()=>dx*(target.x-bot.entity.position.x)+dz*(target.z-bot.entity.position.z);
 try{await bot.lookAt(v(target.x,bot.entity.position.y-2,target.z),true);bot.setControlState('forward',true);while(remaining()>.14&&Date.now()-t<1600){live();await sleep(1);}}
 finally{bot.clearControlStates();}
 for(let k=0;k<25&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03);k++)await sleep(1);
 live();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03||Math.hypot(bot.entity.position.x-target.x,bot.entity.position.z-target.z)>.3)throw Error('rail landing');
 console.log('RAIL_DROP',JSON.stringify({at:new Date().toISOString(),start,target,state:snap()}));
}
console.log("HIGH_BLOCKS",JSON.stringify([77,78,79,80,81,82].map(y=>({y,cols:[-25,-26,-27].map(z=>({z,n:bot.blockAt(v(31,y,z))?.name,shape:bot.blockAt(v(31,y,z))?.shapes}))}))));
let entered=false;
try{console.log('SOURCE',JSON.stringify(snap()));if(bot.entity.position.distanceTo(v(30.568221,58,-24.550919))>.2||bot.health!==10)throw Error('source mismatch');entered=true;await center(30.5,-24.5);await cut(v(30,60,-25));while(bot.entity.position.y<65)await stack();await place(v(30,64,-26));await center(30.5,-25.5);console.log('TRANSITION_B',JSON.stringify(snap()));await railDrop(v(30,63,-27));await railDrop(v(30,61,-26));await railDrop(v(30,59,-27));console.log('RAILS_COMPLETE',JSON.stringify(snap()));}
catch(e){console.log('FAILURE',String(e),JSON.stringify(snap()));}
finally{bot.clearControlStates();await sleep(20);cleanup();}return snap();

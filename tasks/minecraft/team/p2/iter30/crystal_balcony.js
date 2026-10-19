const V=bot.entity.position.constructor,v=(x,y,z)=>new V(x,y,z),sleep=n=>bot.waitForTicks(n);
const full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const air=q=>['air','cave_air','void_air'].includes(bot.blockAt(q)?.name);
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0);
const snap=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),hazards:Object.values(bot.entities).filter(e=>/dragon|fireball|cloud/.test(e.name||'')).map(e=>({id:e.id,n:e.name,p:e.position.clone(),width:e.width,height:e.height}))});
const dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];
let died=false;const death=()=>{died=true;bot.clearControlStates();bot.pathfinder.setGoal(null);};bot.on('death',death);
const live=()=>{if(died||bot.health<=0||bot.game.dimension!=='the_end')throw Error('life/dimension changed');};
const rows=[];let prev=bot.health;const health=()=>{if(bot.health<prev)rows.push({event:'healthLoss',before:prev,...snap()});prev=bot.health;};bot.on('health',health);
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.99,.5],[.5,.01,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99],[.01,.95,.05],[.01,.95,.95],[.01,.5,.05],[.01,.5,.95]]){live();await bot.lookAt(q.offset(...a),true);await sleep(1);const c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return c;}throw Error('no actual visible face '+q);}
async function cut(q){live();if(air(q))return;const b=bot.blockAt(q),tool=bot.inventory.items().find(i=>i.name==='wooden_pickaxe');if(tool)await bot.equip(tool,'hand');else await bot.unequip('hand');const f=await face(q);await bot.dig(bot.blockAt(q),'ignore',dirs[f.face]);await sleep(1);live();if(!air(q))throw Error('dig postcondition '+q);console.log('CUT',q,b.name);}
async function place(q){live();if(full(q))return;for(const f of[1,4,5,2,3,0]){const ref=q.minus(dirs[f]);if(!full(ref))continue;let c;try{c=await face(ref,f);}catch{continue;}const item=bot.inventory.items().find(i=>i.name==='end_stone');if(!item)throw Error('no endstone');await bot.equip(item,'hand');console.log('PLACE_ACTUAL',JSON.stringify({q,ref,face:f,p:bot.entity.position,width:bot.entity.width,height:bot.entity.height}));await bot.placeBlock(bot.blockAt(ref),dirs[f]);await sleep(1);if(!full(q))throw Error('place postcondition '+q);return;}throw Error('no visible anchor '+q);}
async function stack(){live();const a=bot.entity.position.floored(),ref=a.offset(0,-1,0);if(!bot.entity.onGround||!full(ref)||!air(a.offset(0,2,0)))throw Error('stack actual source/headroom');await bot.equip(bot.inventory.items().find(i=>i.name==='end_stone'),'hand');await bot.lookAt(ref.offset(.5,1,.5),true);bot.setControlState('jump',true);try{for(let k=0;k<12&&bot.entity.position.y<a.y+1.04;k++)await sleep(1);live();if(bot.entity.position.y<a.y+1.04)throw Error('stack height');const c=bot.blockAtCursor(4.5);if(!c?.position.equals(ref)||c.face!==1)throw Error('stack actual floor cursor');await bot.placeBlock(bot.blockAt(ref),v(0,1,0));}finally{bot.setControlState('jump',false);}for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03);k++)await sleep(1);live();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-a.y-1)>.03||!full(a))throw Error('stack postcondition');console.log('UP',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health}));}
async function down(){live();const q=bot.entity.position.floored();if(!bot.entity.onGround)throw Error('down not grounded');await cut(q.offset(0,-1,0));for(let k=0;k<20&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y+1)>.03);k++)await sleep(1);live();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y+1)>.03)throw Error('down postcondition');console.log('DOWN',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health}));}
async function center(x,z){const target=v(x,bot.entity.position.y,z),t=Date.now();try{while(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.045&&Date.now()-t<2500){live();await bot.lookAt(v(x,bot.entity.position.y-2,z),true);bot.setControlState('forward',true);await sleep(1);bot.setControlState('forward',false);await sleep(1);}}finally{bot.clearControlStates();}await sleep(2);if(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.12)throw Error('center postcondition');}
function cleanup(){bot.pathfinder.setGoal(null);bot.clearControlStates();bot.removeListener('death',death);bot.removeListener('health',health);console.log('DAMAGE',JSON.stringify(rows));console.log('POST',JSON.stringify(snap()));}
// Ordinary placement and native walking. rails MUST avoid the solid ascent column.
// Requires wall at x31 beside each rail. No actions beyond current visible client reach.
async function railDrop(q){
 live();const start=bot.entity.position.clone(),a=start.floored();
 if(!bot.entity.onGround||Math.abs(q.x-a.x)+Math.abs(q.z-a.z)!==1||(a.y-q.y<1||a.y-q.y>2))throw Error('rail source geometry');
 for(const c of[q,q.offset(0,1,0),q.offset(0,2,0)])if(!air(c))throw Error('rail blocked body '+c);
 // Revisit lane: old landing above our head physically blocks departing support.
 const oldFloor=v(q.x,a.y+1,q.z);if(full(oldFloor)){if(bot.blockAt(oldFloor)?.name!=='end_stone')throw Error('unknown overhead material');console.log('REMOVE_OLD_RAIL_FLOOR',oldFloor);await cut(oldFloor);}
 // Lean toward destination while retaining original support; current ray decides placement.
 const dx=q.x-a.x,dz=q.z-a.z;
 bot.setControlState('sneak',true);
 try{await center(a.x+.5+dx*.18,a.z+.5+dz*.18);await place(q.offset(0,-1,0));}
 finally{bot.setControlState('sneak',false);}
 const target=q.offset(.5,0,.5),t=Date.now();
 const remaining=()=>dx*(target.x-bot.entity.position.x)+dz*(target.z-bot.entity.position.z);
 try{await bot.lookAt(v(target.x,bot.entity.position.y-2,target.z),true);bot.setControlState('forward',true);while(remaining()>.14&&Date.now()-t<1600){live();await sleep(1);}}
 finally{bot.clearControlStates();}
 for(let k=0;k<25&&(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03);k++)await sleep(1);
 live();if(!bot.entity.onGround||Math.abs(bot.entity.position.y-q.y)>.03||!bot.entity.position.floored().equals(q))throw Error('rail landing cell');await sleep(5);if(Math.hypot(bot.entity.position.x-target.x,bot.entity.position.z-target.z)>.15){console.log('RAIL_RECENTER',JSON.stringify({p:bot.entity.position,target}));await center(target.x,target.z);}if(Math.hypot(bot.entity.position.x-target.x,bot.entity.position.z-target.z)>.22)throw Error('rail recenter');
 console.log('RAIL_DROP',JSON.stringify({at:new Date().toISOString(),start,target,state:{at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,ground:bot.entity.onGround,hazards:snap().hazards}}));
}
async function fieldWest(endX=6.5){
 live();const a=bot.entity.position.floored();if(a.y!==58)throw Error('field source height');
 for(let x=a.x-1;x>=Math.floor(endX);x--){const q=v(x,58,a.z);if(!full(q.offset(0,-1,0))||!air(q)||!air(q.offset(0,1,0)))throw Error('field actual lane blocked '+q);}
 const ahead=Object.values(bot.entities).filter(e=>e.name==='area_effect_cloud'&&Math.abs(e.position.y-58)<3&&Math.abs(e.position.z-(a.z+.5))<4&&e.position.x<bot.entity.position.x&&e.position.x>endX-3);if(ahead.length)throw Error('field cloud ahead');
 const t=Date.now();await bot.lookAt(v(bot.entity.position.x-2,56,a.z+.5),true);bot.setControlState('forward',true);
 try{while(bot.entity.position.x>endX+.25&&Date.now()-t<10000){live();await sleep(1);if(Math.abs(bot.entity.position.z-a.z-.5)>.4||bot.entity.position.y<57.9)throw Error('field displacement');}}
 finally{bot.clearControlStates();}
 await sleep(6);live();await center(endX,a.z+.5);console.log('SEPARATED_FIELD',JSON.stringify(snap()));
}
async function pod(){
 const q=bot.entity.position.floored();if(!bot.entity.onGround||!full(q.offset(0,-1,0)))throw Error('pod actual floor');
 for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){await place(q.offset(dx,0,dz));await place(q.offset(dx,1,dz));}
 bot.setControlState('jump',true);try{for(let k=0;k<8&&bot.entity.position.y<q.y+.65;k++)await sleep(1);await place(q.offset(1,2,0));}finally{bot.setControlState('jump',false);}
 for(let k=0;k<20&&!bot.entity.onGround;k++)await sleep(1);await place(q.offset(0,2,0));
 for(let i=0;i<3;i++){const faces=[[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({p:q.offset(...d),n:bot.blockAt(q.offset(...d))?.name,full:full(q.offset(...d))}));if(!faces.every(f=>f.full))throw Error('pod boundary changed');console.log('ENDING',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,hp:bot.health,food:bot.food,faces}));await sleep(10);}
}
async function railEscape(){
 live();bot.clearControlStates();for(let k=0;k<30&&!bot.entity.onGround;k++)await sleep(1);let q=bot.entity.position.floored();
 if(q.x!==30||![-24,-25,-26].includes(q.z))throw Error('escape off column');
 while(bot.entity.position.y>61.03){q=bot.entity.position.floored();const nz=q.z===-24?-25:q.z===-25?-26:-25;await railDrop(v(30,q.y-2,nz));}
 q=bot.entity.position.floored();if(q.y===61&&q.z===-25)await railDrop(v(30,60,-26));
 else if(q.y===61&&q.z===-26){await railDrop(v(29,59,-26));await railDrop(v(28,58,-26));}
 q=bot.entity.position.floored();if(q.y===60&&q.z===-26)await railDrop(v(29,58,-26));
 if(bot.entity.position.floored().y!==58)throw Error('escape ground not reached');
 await fieldWest();await pod();
}
let entered=false,attacked=false,target,phase='source';const events=[];const gone=e=>{if(e===target)events.push({event:'targetGone',...snap()});};bot.on('entityGone',gone);
try{console.log('SOURCE',JSON.stringify(snap()));if(bot.entity.position.distanceTo(v(30.56,58,-24.55))>.2||bot.health!==10||count('snowball')!==1)throw Error('source mismatch');target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(v(33.5,80,-24.5))<.1);if(!target)throw Error('target missing');entered=true;await center(30.5,-24.5);await cut(v(30,60,-25));phase='ascent';while(bot.entity.position.y<59.99)await stack();await center(30.5,-23.5);while(bot.entity.position.y<78.99)await stack();await center(30.55,-23.5);console.log('AT_TARGET_HEIGHT',JSON.stringify(snap()));phase='interaction';await cut(v(31,80,-24));await cut(v(31,79,-24));await place(v(31,79,-24));await cut(v(31,80,-25));await cut(v(31,79,-25));await place(v(31,79,-25));await place(v(30,78,-25));await center(30.69,-24.5);console.log('ACTUAL_FULL_SHIELD',JSON.stringify({p:v(31,79,-24),block:bot.blockAt(v(31,79,-24))?.name,shapes:bot.blockAt(v(31,79,-24))?.shapes,state:snap()}));await bot.equip(bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');
for(const off of[[0,.5,0],[0,.05,0],[-.5,.25,0],[-.8,.05,0],[0,1,0]]){live();const aim=target.position.offset(...off),eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),d=aim.minus(eye);await bot.lookAt(aim,true);await sleep(2);const cursor=bot.entityAtCursor(3);console.log('CURSOR',JSON.stringify({at:new Date().toISOString(),p:bot.entity.position,eye,aim,d:d.norm(),rootDistance:eye.distanceTo(target.position),yaw:bot.entity.yaw,pitch:bot.entity.pitch,target:{id:target.id,p:target.position,w:target.width,h:target.height},cursor:cursor?{id:cursor.id,n:cursor.name}:null,block:bot.blockAtCursor(4.5)?.position}));if(bot.entity.position.distanceTo(target.position)<=3&&d.norm()<=3&&!bot.world.raycast(eye,d.scaled(1/d.norm()),d.norm()-.01)){bot.attack(target);attacked=true;console.log('ATTACK',new Date().toISOString());await sleep(10);break;}}
console.log('EFFECT',JSON.stringify({attacked,present:!!bot.entities[target.id],crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>({id:e.id,p:e.position})),events,state:snap()}));
}catch(e){console.log('FAILURE',String(e),phase,JSON.stringify(snap()));}
finally{phase='descent';if(entered&&!died)try{if(bot.entity.onGround&&Math.abs(bot.entity.position.y-79)<.03)await center(30.5,-24.5);await railEscape();}catch(e){console.log('RECOVERY_FAILURE',String(e),JSON.stringify(snap()));}await sleep(20);console.log('FINAL_EFFECT',JSON.stringify({attacked,targetPresent:target?!!bot.entities[target.id]:null,events,crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>({id:e.id,p:e.position}))}));bot.removeListener('entityGone',gone);cleanup();}return snap();

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
try{console.log('SOURCE',JSON.stringify(snap()));live();if(bot.entity.position.distanceTo(v(2.5,63,-1.5))>1.3||bot.health<=0)throw Error('fountain rescue source');if(bot.entity.onGround&&Math.abs(bot.entity.position.y-63)<.03)await down();const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.maxDropDown=2;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);const goal=new goals.GoalBlock(6,58,-26);bot.pathfinder.setGoal(goal);const t=Date.now();try{while(Date.now()-t<25000&&!goal.isEnd(bot.entity.position.floored())){live();await bot.look(bot.entity.yaw,-.8,true);await sleep(2);}}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}await sleep(4);live();console.log('RETREAT_POSITION',JSON.stringify(snap()));if(!goal.isEnd(bot.entity.position.floored()))throw Error('retreat endpoint');await center(6.5,-25.5);await pod();await sleep(40);}catch(e){console.log('FAILURE',String(e),JSON.stringify(snap()));}finally{cleanup();}return snap();

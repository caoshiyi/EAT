async function arenaProgram(bot, Movements, goals) {
// Iter20 fresh primary field: normal camera/jump/place/dig/move only.
// Uses P4 physically qualified two-UP method and reviewed fresh P2 face sampler.
const V=require('vec3').Vec3,begin=Date.now(),capNames=['cobbled_deepslate','stone_bricks','cracked_stone_bricks','mossy_stone_bricks','oak_planks','end_stone','tuff','basalt'];
let dead=false,phase='OW',issue=null,pillars=[],floors=[],cuts=[],seals=[],safe=null,entryHP=null,raisedHP=null;
const death=()=>{dead=true};bot.on('death',death);const cap=()=>bot.inventory.items().find(i=>capNames.includes(i.name));const capCount=()=>bot.inventory.items().filter(i=>capNames.includes(i.name)).reduce((s,i)=>s+i.count,0);
function alive(){if(dead||bot.health<=0||Date.now()-begin>140000)throw Error('life/budget');}
function full(p){return bot.blockAt(p)?.shapes.some(s=>s.join(',')==='0,0,0,1,1,1');}
function cloudState(){return Object.values(bot.entities).filter(e=>e.name==='area_effect_cloud').map(e=>({id:e.id,p:e.position.clone(),r:e.metadata?.[8],height:e.height,width:e.width}));}
async function face(p,f){const ns=[new V(0,-1,0),new V(0,1,0),new V(0,0,-1),new V(0,0,1),new V(-1,0,0),new V(1,0,0)],n=ns[f];const tries=[];
 for(const [a,b] of [[.35,.65],[.65,.35],[.25,.25],[.75,.75],[.35,.35],[.65,.65]]){alive();const q=n.y?new V(a,n.y>0?1:0,b):n.z?new V(a,b,n.z>0?1:0):new V(n.x>0?1:0,a,b);const aim=p.plus(q).minus(n.scaled(.015));await bot.lookAt(aim,true);await bot.waitForTicks(1);const h=bot.blockAtCursor(4.5);tries.push(h&&{p:h.position,face:h.face});if(h&&h.position.equals(p)&&h.face===f&&h.intersect&&[1.62,1.8].every(v=>bot.entity.position.offset(0,v,0).distanceTo(h.intersect)<=4.5))return {p,face:f,aim,intersect:h.intersect};}
 console.log('FACE_REFUSED',JSON.stringify({p,f,body:bot.entity.position,tries}));throw Error('no visible requested face '+p+' '+f);
}
async function horizontal(x,z,y,sneak=true,budget=5000,enter=false){const until=Date.now()+budget;bot.setControlState('sneak',sneak);bot.setControlState('sprint',false);
 try{while(Math.hypot(bot.entity.position.x-x,bot.entity.position.z-z)>.035){alive();if(enter&&bot.game.dimension==='the_end')break;if(Date.now()>until)throw Error('horizontal budget '+x+','+z);if(!enter&&Math.abs(bot.entity.position.y-y)>.3)throw Error('unexpected height');await bot.lookAt(new V(x,bot.entity.position.y+1.62,z),true);bot.setControlState('forward',true);await bot.waitForTicks(1);}}
 finally{bot.setControlState('forward',false);}await bot.waitForTicks(1);
}
async function jumpUp(refp){alive();const ref=bot.blockAt(refp),dest=refp.offset(0,1,0),y0=bot.entity.position.y;if(!full(refp)||bot.blockAt(dest)?.boundingBox!=='empty')throw Error('pillar geometry');const it=cap();if(!it)throw Error('no cap');await bot.equip(it,'hand');await face(refp,1);bot.setControlState('sneak',false);bot.setControlState('jump',true);
 try{let apex=false;for(let t=0;t<12;t++){await bot.waitForTicks(1);alive();if(bot.entity.position.y>y0+1.015){apex=true;break;}}if(!apex)throw Error('no jump height');const ray=await face(refp,1);console.log('UP_PRE',JSON.stringify({ref:refp,p:bot.entity.position,ray,hp:bot.health}));await bot.placeBlock(ref,new V(0,1,0));}
 finally{bot.setControlState('jump',false);}await bot.waitForTicks(8);if(!full(dest)||Math.abs(bot.entity.position.y-y0-1)>.08||!bot.entity.onGround)throw Error('pillar physical rise absent');pillars.push({p:dest,n:bot.blockAt(dest).name,hp:bot.health,body:bot.entity.position.clone()});safe={x:dest.x+.5,z:dest.z+.5,y:dest.y+1};console.log('UP_EFFECT',JSON.stringify(pillars.at(-1)));
}
async function westFloor(x){const p=new V(x,50,0);if(full(p))return;if(bot.blockAt(p)?.boundingBox!=='empty'||!full(p.offset(1,0,0)))throw Error('bridge geometry '+x);
 safe={x:x+1.5,z:.5,y:51};await horizontal(x+.90,.5,51,true,2500);const ref=bot.blockAt(p.offset(1,0,0)),ray=await face(ref.position,4);const it=cap();if(!it)throw Error('no floor cap');await bot.equip(it,'hand');console.log('FLOOR_PRE',JSON.stringify({dest:p,ray,body:bot.entity.position,hp:bot.health}));await bot.placeBlock(ref,new V(-1,0,0));await bot.waitForTicks(1);if(!full(p))throw Error('floor no physical effect');floors.push({p,n:bot.blockAt(p).name,hp:bot.health});safe={x:x+.5,z:.5,y:51};console.log('FLOOR_EFFECT',JSON.stringify(floors.at(-1)));
}
async function cut(p){alive();let b=bot.blockAt(p);if(b?.boundingBox==='empty')return;if(b?.name!=='end_stone')throw Error('unexpected native '+b?.name);const ray=await face(p,5);const picks=bot.inventory.items().filter(i=>i.name==='stone_pickaxe').sort((a,b)=>a.durabilityUsed-b.durabilityUsed);if(!picks.length)throw Error('no pick');await bot.equip(picks[0],'hand');console.log('CUT_PRE',JSON.stringify({p,ray,hp:bot.health}));await bot.dig(b,false,'raycast');await bot.waitForTicks(1);if(bot.blockAt(p).boundingBox!=='empty')throw Error('cut no physical effect');cuts.push(p);}
async function seal(p,refp,f){if(full(p))return;const ns=[new V(0,-1,0),new V(0,1,0),new V(0,0,-1),new V(0,0,1),new V(-1,0,0),new V(1,0,0)];const ray=await face(refp,f),it=cap();if(!it)throw Error('no seal cap');await bot.equip(it,'hand');await bot.placeBlock(bot.blockAt(refp),ns[f]);await bot.waitForTicks(1);if(!full(p))throw Error('seal no effect');seals.push(p);console.log('SEAL_EFFECT',JSON.stringify({p,ray}));}
try{
 if(bot.game.dimension!=='overworld'||capCount()<24||!bot.inventory.items().some(i=>i.name==='stone_sword'))throw Error('actual kit precondition');
 const route=global.P4Route20;if(!route?.length)throw Error('no fresh route plan');const m=new Movements(bot);m.canDig=false;m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);const owHP=bot.health;
 for(const [x,y,z] of route){alive();const p=new V(x,y,z);if(!full(p.offset(0,-1,0))||[0,1].some(d=>bot.blockAt(p.offset(0,d,0))?.boundingBox!=='empty'))throw Error('OW route changed');if(bot.health<owHP)throw Error('OW damage');await bot.pathfinder.goto(new goals.GoalBlock(x,y,z));}
 bot.pathfinder.setGoal(null);bot.clearControlStates();phase='ENTER';await horizontal(132.5,2275.5,-36,false,4000,true);await horizontal(133.5,2275.5,-36,false,4000,true);let until=Date.now()+6500;while(bot.game.dimension==='overworld'&&Date.now()<until)await bot.waitForTicks(1);if(bot.game.dimension!=='the_end')throw Error('no End transition');bot.clearControlStates();for(let t=0;t<8&&!bot.entity.onGround;t++)await bot.waitForTicks(1);
 entryHP=bot.health;console.log('ARRIVAL',JSON.stringify({p:bot.entity.position,hp:entryHP,clouds:cloudState(),caps:capCount()}));
 phase='PILLAR';await horizontal(100.5,.5,49,false,1800);await jumpUp(new V(100,48,0));await jumpUp(new V(100,49,0));raisedHP=bot.health;console.log('RAISED',JSON.stringify({p:bot.entity.position,hp:raisedHP,clouds:cloudState(),caps:capCount()}));
 phase='BRIDGE';for(let x=99;x>=84;x--)await westFloor(x);await horizontal(84.5,.5,51,true,2500);console.log('BRIDGE_RETAINED',JSON.stringify({p:bot.entity.position,hp:bot.health,clouds:cloudState()}));
 phase='NATIVE';for(let x=83;x>=75;x--){await cut(new V(x,52,0));await cut(new V(x,51,0));await westFloor(x);await horizontal(x+.5,.5,51,true,2500);safe={x:x+.5,z:.5,y:51};}
 phase='SEAL';await seal(new V(78,51,0),new V(78,50,0),1);await seal(new V(78,52,0),new V(78,53,0),0);
 phase='NATIVE_CHECK';const hpBefore=bot.health;bot.clearControlStates();await bot.waitForTicks(60);console.log('RETAINED_NATIVE',JSON.stringify({p:bot.entity.position,hpBefore,hp:bot.health,ground:bot.entity.onGround,floor:bot.blockAt(new V(75,50,0)).name,roof:bot.blockAt(new V(75,53,0)).name,front:bot.blockAt(new V(74,51,0)).name,clouds:cloudState()}));
}catch(e){issue=String(e);console.log('FAIL',JSON.stringify({phase,issue,p:bot.entity.position,hp:bot.health,safe}));
 if(!dead&&bot.game.dimension==='the_end'&&safe&&Math.abs(bot.entity.position.y-safe.y)<.3){try{await horizontal(safe.x,safe.z,safe.y,true,3000);await bot.waitForTicks(5);console.log('ERROR_RETREAT',JSON.stringify({p:bot.entity.position,hp:bot.health,full:full(bot.entity.position.floored().offset(0,-1,0)),clouds:cloudState()}));}catch(r){console.log('ERROR_RETREAT_FAILED',String(r));}}
}finally{
 bot.removeListener('death',death);bot.pathfinder.setGoal(null);
 // Sneak is retained on any unverified edge. Clear only after actual centered full support.
 const p=bot.entity.position,root=p.floored(),centered=Math.abs(p.x-(root.x+.5))<.26&&Math.abs(p.z-(root.z+.5))<.26;if(bot.game.dimension==='overworld'||(centered&&full(root.offset(0,-1,0))))bot.clearControlStates();else{bot.setControlState('forward',false);bot.setControlState('jump',false);bot.setControlState('sprint',false);bot.setControlState('sneak',true);}
 global.P4RaisedState20={phase,issue,safe,pillars,floors,cuts,seals};console.log('FINAL',JSON.stringify({phase,issue,dead,elapsed:Date.now()-begin,p:bot.entity.position,hp:bot.health,food:bot.food,dim:bot.game.dimension,ground:bot.entity.onGround,velocity:bot.entity.velocity,entryHP,raisedHP,pillars,floors,cuts,seals,clouds:cloudState(),controls:bot.controlState,inv:bot.inventory.items().map(i=>({n:i.name,c:i.count,wear:i.durabilityUsed}))}));
}

}

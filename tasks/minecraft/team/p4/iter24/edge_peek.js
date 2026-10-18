const V=bot.entity.position.constructor,W=new V(-9,26,-38),E=W.offset(1,0,0),pit=W.offset(0,-1,0),below=W.offset(0,-2,0),start=Date.now(),self=bot.entity;
const full=p=>!!bot.blockAt(p)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),air=p=>bot.blockAt(p)?.name==='air';
const count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0);
const flags=()=>Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]));
const shell=()=>[W.offset(0,-1,0),E.offset(0,-1,0),W.offset(0,2,0),E.offset(0,2,0),W.offset(-1,0,0),W.offset(-1,1,0),E.offset(1,0,0),E.offset(1,1,0),...[-1,1].flatMap(z=>[W.offset(0,0,z),W.offset(0,1,z),E.offset(0,0,z),E.offset(0,1,z)])].map(p=>({p,n:bot.blockAt(p)?.name,full:full(p)}));
const state=()=>({at:new Date().toISOString(),ms:Date.now()-start,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,eye:bot.entity.eyeHeight,width:bot.entity.width,ground:bot.entity.onGround,flags:flags(),goal:!!bot.pathfinder.goal,inv:bot.inventory.items().map(i=>[i.name,i.count])});
function live(ending=false){if(bot.entity!==self||bot.health<20||bot.game.dimension!=='overworld')throw Error('life/health/dimension');if(!ending&&Date.now()-start>38000)throw Error('workdeadline');}
async function face(p,f=null){for(const d of(f===4?[[.001,.5,.5],[.001,.8,.5],[.001,.2,.5]]:[[.5,.99,.5],[.01,.99,.5],[.5,.5,.5],[.99,.99,.5]])){await bot.lookAt(p.offset(...d),true);const c=bot.blockAtCursor(4.5);if(c?.position.equals(p)&&(f===null||c.face===f)&&c.intersect&&bot.entity.position.offset(0,bot.entity.eyeHeight,0).distanceTo(c.intersect)<=4.5)return c;}throw Error('no actualvisibleface '+p+' '+f);}
async function walk(p,ending=false){live(ending);const goal=new goals.GoalBlock(p.x,p.y,p.z),t=Date.now();bot.pathfinder.setGoal(goal);try{while(bot.pathfinder.goal&&Date.now()-t<4200){await bot.waitForTicks(1);live(ending);}}finally{bot.pathfinder.setGoal(null);bot.clearControlStates();}await bot.waitForTicks(8);if(!bot.entity.onGround||Math.abs(bot.entity.position.y-p.y)>.1||Math.hypot(bot.entity.position.x-p.x-.5,bot.entity.position.z-p.z-.5)>.35)throw Error('walkpost '+JSON.stringify(state()));console.log('WALK',JSON.stringify(state()));}
async function handcut(p){live();const b=bot.blockAt(p);if(b?.name!=='stone')throw Error('handkind');const c=await face(p);console.log('HANDCUT_PRE',JSON.stringify({p,hit:c.intersect,face:c.face,state:state()}));await bot.unequip('hand');await bot.dig(b,false,'raycast');await bot.waitForTicks(5);if(!air(p))throw Error('cutnotAIR');console.log('HANDCUT_POST',JSON.stringify({p,state:state()}));}
async function restore(ending=false){live(ending);if(full(pit))return;if(!air(pit)||!full(below))throw Error('restoregeometry');const item=bot.inventory.items().find(i=>i.name==='gravel');if(!item)throw Error('restorematerial');await bot.equip(item,'hand');const c=await face(below,1);console.log('FALLBACK_TOP_PRE',JSON.stringify({ref:below,hit:c.intersect,state:state()}));await bot.placeBlock(bot.blockAt(below),new V(0,1,0));await bot.waitForTicks(8);if(!full(pit))throw Error('restorefailed');console.log('FALLBACK_TOP_DONE',JSON.stringify(state()));}
bot.clearControlStates();bot.pathfinder.setGoal(null);
const m=new Movements(bot);m.canDig=false;m.allowParkour=false;m.allowSprinting=false;m.allow1by1towers=false;m.scafoldingBlocks=[];m.maxDropDown=1;bot.pathfinder.setMovements(m);
let pitMade=false;
try{
 live();if(bot.entity.position.floored().x!==W.x||bot.entity.position.floored().y!==W.y||bot.entity.position.floored().z!==W.z||!shell().every(c=>c.full)||!full(below)||!air(E.offset(0,1,0))||count('gravel')<1||bot.entity.width!==.6)throw Error('startgate');
 await handcut(E);await walk(E);
 await handcut(pit);pitMade=true;
 bot.setControlState('sneak',true);await bot.waitForTicks(4);if(!bot.getControlState('sneak'))throw Error('sneaknotheld');
 await bot.lookAt(new V(-12,bot.entity.position.y+bot.entity.eyeHeight,-37.5),true);
 bot.setControlState('forward',true);
 try{for(let i=0;i<25;i++){await bot.waitForTicks(1);live();if(bot.entity.position.y<25.9||bot.entity.position.x<=-8.08)break;}}finally{bot.setControlState('forward',false);}
 await bot.waitForTicks(4);const p=bot.entity.position.clone(),w=bot.entity.width,overlap=Math.max(0,Math.min(p.x+w/2,E.x+1)-Math.max(p.x-w/2,E.x));
 console.log('EDGE_ACTUAL',JSON.stringify({state:state(),rootFloor:bot.blockAt(p.floored().offset(0,-1,0))?.name,supportOverlapX:overlap,pit:bot.blockAt(pit)?.name}));
 if(p.y!==26||!bot.entity.onGround||p.x>=-8.01||p.x<=-8.25||Math.abs(p.z+37.5)>.2||overlap<=0||!air(pit))throw Error('edgecase notqualified');
 const item=bot.inventory.items().find(i=>i.name==='gravel');await bot.equip(item,'hand');const ref=E.offset(0,-1,0),c=await face(ref,4);
 console.log('EDGE_FACE',JSON.stringify({ref,dest:pit,face:c.face,hit:c.intersect,distance:bot.entity.position.offset(0,bot.entity.eyeHeight,0).distanceTo(c.intersect),state:state()}));
 await bot.placeBlock(bot.blockAt(ref),new V(-1,0,0));await bot.waitForTicks(8);
 console.log('EDGE_PLACE_POST',JSON.stringify({pit:bot.blockAt(pit)?.name,full:full(pit),state:state()}));if(!full(pit))throw Error('edgeplacefailed');
}catch(e){console.log('EXPERIMENT_FAILURE',String(e));}
finally{
 bot.pathfinder.setGoal(null);bot.clearControlStates();
 if(bot.entity===self&&bot.game.dimension==='overworld'){
  try{
   if(pitMade&&!full(pit)){
    if(bot.entity.position.y<25.9){await bot.lookAt(E.offset(.5,1.4,.5),true);bot.setControlState('jump',true);bot.setControlState('forward',true);try{for(let i=0;i<40;i++){await bot.waitForTicks(1);if(bot.entity.position.x>-7.8&&bot.entity.position.y>25.9&&bot.entity.onGround)break;}}finally{bot.clearControlStates();}}
    if(bot.entity.position.y>25.9){await walk(E,true);await restore(true);}
   }
   if(full(pit)&&air(E)&&air(E.offset(0,1,0)))await walk(W,true);
  }catch(e){console.log('ENDING_FAILURE',String(e));}
  bot.clearControlStates();bot.pathfinder.setGoal(null);await bot.waitForTicks(5);
  for(let i=0;i<3;i++){console.log('FINAL_OUTER16',JSON.stringify({sample:i,state:state(),cells:shell(),westBody:[bot.blockAt(W)?.name,bot.blockAt(W.offset(0,1,0))?.name],eastBody:[bot.blockAt(E)?.name,bot.blockAt(E.offset(0,1,0))?.name]}));await bot.waitForTicks(5);}
 }
}

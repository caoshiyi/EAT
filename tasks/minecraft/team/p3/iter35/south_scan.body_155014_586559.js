const {Vec3}=require('vec3'),v=(x,y,z)=>new Vec3(x,y,z);const wait=n=>bot.waitForTicks(n),count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((a,i)=>a+i.count,0),full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1');
const state=()=>({at:new Date().toISOString(),p:bot.entity.position.clone(),hp:bot.health,food:bot.food,ground:bot.entity.onGround,inv:bot.inventory.items().map(i=>[i.name,i.count,i.durabilityUsed]),time:bot.time.timeOfDay,dim:bot.game.dimension,cursor:bot.inventory.selectedItem?.name,controls:bot.controlState,goal:!!bot.pathfinder.goal});
const dirs=[v(0,-1,0),v(0,1,0),v(0,0,-1),v(0,0,1),v(-1,0,0),v(1,0,0)];
async function face(q,f=null){for(const a of[[.5,.5,.5],[.5,.01,.5],[.5,.99,.5],[.01,.5,.5],[.99,.5,.5],[.5,.5,.01],[.5,.5,.99],[.01,.01,.5],[.99,.01,.5],[.5,.01,.01],[.5,.01,.99]]){let aim=q.offset(...a),eye=bot.entity.position.offset(0,bot.entity.eyeHeight,0),d=aim.minus(eye),dist=d.norm();if(dist>4.4||dist<.001)continue;const h=bot.world.raycast(eye,d.scaled(1/dist),dist+.02);if(!h?.position.equals(q)||(f!==null&&h.face!==f))continue;await bot.lookAt(aim,true);await wait(1);let c=bot.blockAtCursor(4.5);if(c?.position.equals(q)&&(f===null||c.face===f))return c;}throw Error('face '+q+' f'+f);}
async function cut(q){const b=bot.blockAt(q);if(b?.boundingBox==='empty')return;if(!b||!['dirt','grass_block','spruce_log','stone','granite','diorite','andesite','cobblestone','gravel','copper_ore','iron_ore','coal_ore','netherrack','blackstone','sandstone','basalt','sand','snow','spruce_planks','crafting_table','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','cobbled_deepslate','deepslate','tuff','end_stone','oak_planks','bookshelf','iron_bars','white_bed'].includes(b.name))throw Error('cut type '+b?.name);const suffix=b.name.endsWith('log')?'_axe':['dirt','grass_block','gravel'].includes(b.name)?'_shovel':'_pickaxe';const tool=bot.inventory.items().filter(i=>i.name.endsWith(suffix)).sort((a,b)=>(b.name.startsWith('stone_')?2:1)-(a.name.startsWith('stone_')?2:1))[0];if(tool)await bot.equip(tool,'hand');else await bot.unequip('hand');const visible=await face(q);await bot.dig(b,true,dirs[visible.face]);await wait(4);if(bot.blockAt(q)?.boundingBox!=='empty')throw Error('cut post');console.log('CUT',q,b.name);}
async function place(q,name='dirt'){if(full(q))return;if(bot.blockAt(q)?.boundingBox!=='empty')throw Error('occupied '+q);const item=bot.inventory.items().find(i=>i.name===name);if(!item)throw Error('fund '+name);for(let f=0;f<6;f++){const ref=q.minus(dirs[f]);if(!full(ref))continue;try{await face(ref,f);}catch{continue;}await bot.equip(item,'hand');await bot.placeBlock(bot.blockAt(ref),dirs[f]);await wait(4);if(!full(q))throw Error('place post');console.log('PLACE',q,name);return;}throw Error('noanchor '+q);}
function stop(){bot.pathfinder.setGoal(null);bot.clearControlStates();}
async function move(q,ms=3500){const initialHP=bot.health;const m=new Movements(bot);m.canDig=false;m.infiniteLiquidDropdownDistance=false;for(const n of ['water','lava','magma_block','powder_snow','sweet_berry_bush'])if(bot.registry.blocksByName[n])m.blocksToAvoid.add(bot.registry.blocksByName[n].id);m.allow1by1towers=false;m.allowParkour=false;m.allowSprinting=false;m.maxDropDown=2;m.scafoldingBlocks=[];bot.pathfinder.setMovements(m);const g=new goals.GoalBlock(q.x,q.y,q.z);bot.pathfinder.setGoal(g);let t=Date.now();try{while(Date.now()-t<ms&&!(g.isEnd(bot.entity.position.floored())&&bot.entity.onGround)){if(bot.health<initialHP)throw Error('move HP loss');await wait(1);}}finally{stop();}await wait(12);if(!g.isEnd(bot.entity.position.floored())||!bot.entity.onGround)throw Error('move post '+JSON.stringify(state()));console.log('MOVE',bot.entity.position,bot.health,bot.food);}
function boundary(){let q=bot.entity.position.floored();return [[0,-1,0],[0,2,0],[1,0,0],[1,1,0],[-1,0,0],[-1,1,0],[0,0,1],[0,1,1],[0,0,-1],[0,1,-1]].map(d=>({q:q.offset(...d),n:bot.blockAt(q.offset(...d))?.name,full:full(q.offset(...d))}));}
async function end(){stop();for(let k=0;k<3;k++){console.log('ENDING',JSON.stringify({...state(),faces:boundary()}));await wait(3);}return state();}


async function preciseCenter(){stop();const c=bot.entity.position.floored().offset(.5,0,.5),hp=bot.health,t=Date.now();try{bot.setControlState('sneak',true);while(Math.hypot(c.x-bot.entity.position.x,c.z-bot.entity.position.z)>.065&&Date.now()-t<2500){if(bot.health<hp)throw Error('center HP');await bot.lookAt(v(c.x,bot.entity.position.y+bot.entity.eyeHeight,c.z),true);bot.setControlState('forward',true);await wait(1);}}finally{stop();}await wait(6);if(Math.hypot(c.x-bot.entity.position.x,c.z-bot.entity.position.z)>.1)throw Error('center post');}
async function seal(){stop();await preciseCenter();const p=bot.entity.position.floored();for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[1,1,0],[-1,1,0],[0,1,1],[0,1,-1],[0,2,0]]){const q=p.offset(...d);if(full(q))continue;const mat=['end_stone','cobblestone','dirt','basalt','diorite','andesite','netherrack'].find(n=>count(n));if(!mat)throw Error('seal actual fund');await place(q,mat);}console.log('SEALED',JSON.stringify(boundary()));}

async function phase(test,action){bot.setControlState('jump',true);try{for(let k=0;k<15;k++){await wait(1);if(test()){await action();return;}}throw Error('jump phase');}finally{bot.setControlState('jump',false);}}
async function land(y){for(let k=0;k<25;k++){await wait(1);if(bot.entity.onGround&&Math.abs(bot.entity.position.y-y)<.04)return;}throw Error('landing '+y);}
async function closedUp(){const p=bot.entity.position.floored(),hp=bot.health,t=Date.now();if(!boundary().every(b=>b.full)||!bot.entity.onGround)throw Error('UP source');await cut(p.offset(0,2,0));await phase(()=>bot.entity.position.y>p.y+.5,()=>place(p,'cobblestone'));await land(p.y+1);for(const d of[[1,2,0],[-1,2,0],[0,2,1],[0,2,-1]])await place(p.offset(...d),'end_stone');if(!full(p.offset(0,3,0))){await phase(()=>bot.entity.position.y>p.y+1.4,()=>place(p.offset(1,3,0),'end_stone'));bot.setControlState('sneak',true);await land(p.y+1);stop();await place(p.offset(0,3,0),'end_stone');}console.log('ONE_UP',JSON.stringify({ms:Date.now()-t,state:state(),faces:boundary()}));if(bot.health<hp||!boundary().every(b=>b.full))throw Error('UP changed');}
async function southDown(){stop();const p=bot.entity.position.floored();if(p.x!==12||p.z!==25||p.y<55||p.y>58)throw Error('DOWN source');while(bot.entity.position.y>55.04){let q=bot.entity.position.floored();if(!full(q.offset(0,-2,0)))throw Error('DOWN nextfloor');await cut(q.offset(0,-1,0));await land(q.y-1);}await place(v(12,57,25),'end_stone');console.log('SOUTH_DOWN',JSON.stringify({...state(),faces:boundary()}));}

// UNQUALIFIED at new fixture; default DRY. Compose with travel_core.js.
// Read-only component. No item use/movement. Paste with observed current entity and launch.
// origin: actual projectile spawn (first native jump tick feet +1.52).
// velocity: observed spawned projectile velocity, or explicit nominal HYPOTHESIS.
// target: actual loaded end_crystal entity; test collision with its public width/height.
function inspectArc(origin, velocity, target, ticks=150) {
  let p=origin.clone(), vel=velocity.clone(), peak=p.y;
  const lo=target.position.offset(-target.width/2,0,-target.width/2);
  const hi=target.position.offset(target.width/2,target.height,target.width/2);
  function enterBox(a,b){
    let t0=0,t1=1;
    for(const k of ['x','y','z']){
      const d=b[k]-a[k];
      if(Math.abs(d)<1e-10){if(a[k]<lo[k]||a[k]>hi[k])return null;continue;}
      let u=(lo[k]-a[k])/d,w=(hi[k]-a[k])/d;if(u>w)[u,w]=[w,u];
      t0=Math.max(t0,u);t1=Math.min(t1,w);if(t0>t1)return null;
    }
    return t0;
  }
  for(let tick=0;tick<ticks;tick++){
    const next=p.plus(vel),delta=next.minus(p),length=delta.norm();
    if(!bot.blockAt(p)||!bot.blockAt(next))return {status:'unloaded',tick,p,next};
    const hit=length>1e-10?bot.world.raycast(p,delta.scaled(1/length),length):null;
    const entityT=enterBox(p,next);
    // raycast's intersect is the physical hit point, position is block coords.
    if(hit&&!hit.intersect)return {status:'ray_api_missing_intersect',tick,hit:hit.name};
    const blockT=hit?hit.intersect.distanceTo(p)/length:Infinity;
    if(entityT!==null&&entityT<blockT)return {status:'nominal_target_intersection',tick:tick+entityT,peak,p:p.plus(delta.scaled(entityT))};
    if(hit)return {status:'blocked',tick,peak,block:hit.name,at:hit.position,intersect:hit.intersect};
    p=next;peak=Math.max(peak,p.y);vel=vel.scaled(.99);vel.y-=.03;
  }
  return {status:'no_intersection',peak,terminal:p};
}


console.log('SOURCE',JSON.stringify(state()));try{await closedUp();await closedUp();await cut(v(12,59,25));const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(v(12.5,101,39.5))<.1),p=bot.entity.position,R=target.position.minus(p);let rows=[];for(let deg=77;deg<=80.5;deg+=.1){let a=deg*Math.PI/180,d=R.clone();d.y=0;d=d.scaled(1/d.norm());let vel=v(d.x*1.5*Math.cos(a),1.5*Math.sin(a)+.42,d.z*1.5*Math.cos(a)),r=inspectArc(p.offset(0,1.94,0),vel,target);rows.push({deg:Math.round(deg*10)/10,r});}console.log('SCAN',JSON.stringify(rows));}catch(e){console.log('FAIL',String(e));}finally{await place(v(12,59,25),'end_stone');await southDown();stop();}

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
async function closedUp(material='cobblestone'){const p=bot.entity.position.floored(),hp=bot.health,t=Date.now();if(!boundary().every(b=>b.full)||!bot.entity.onGround)throw Error('UP source');await cut(p.offset(0,2,0));await phase(()=>bot.entity.position.y>p.y+.5,()=>place(p,material));await land(p.y+1);for(const d of[[1,2,0],[-1,2,0],[0,2,1],[0,2,-1]])await place(p.offset(...d),'end_stone');if(!full(p.offset(0,3,0))){await phase(()=>bot.entity.position.y>p.y+1.4,()=>place(p.offset(1,3,0),'end_stone'));bot.setControlState('sneak',true);await land(p.y+1);stop();await place(p.offset(0,3,0),'end_stone');}console.log('ONE_UP',JSON.stringify({ms:Date.now()-t,state:state(),faces:boundary()}));if(bot.health<hp||!boundary().every(b=>b.full))throw Error('UP changed');}
async function northDown(){stop();let p=bot.entity.position.floored();if(p.x!==-9||p.z!==-26||p.y<55||p.y>63)throw Error('DOWN source');while(bot.entity.position.y>55.04){const q=bot.entity.position.floored();if(!full(q.offset(0,-2,0)))throw Error('DOWN nextfloor');await cut(q.offset(0,-1,0));await land(q.y-1);}await place(v(-9,57,-26),'end_stone');console.log('NORTH_DOWN',JSON.stringify({...state(),faces:boundary()}));}
console.log('SOURCE',JSON.stringify(state()));if(!bot.entity.position.floored().equals(v(-9,55,-26)))throw Error('source');let damage=[];const hurt=e=>{if(e.id===bot.entity.id)damage.push({at:new Date().toISOString(),hp:bot.health,p:bot.entity.position.clone(),dragon:Object.values(bot.entities).filter(x=>x.name==='ender_dragon').map(x=>({p:x.position,meta:x.metadata}))});};bot.on('entityHurt',hurt);try{await preciseCenter();let launchWindow=false;for(let k=0;k<600;k++){const dragon=Object.values(bot.entities).find(e=>e.name==='ender_dragon');if(dragon&&(Math.hypot(dragon.position.x+8.5,dragon.position.z+25.5)>45||dragon.position.y>85)){console.log('WINDOW',JSON.stringify({dragon:dragon.position,meta:dragon.metadata,state:state()}));launchWindow=true;break;}await wait(1);}if(!launchWindow)throw Error('no observed departure window');for(let i=0;i<7;i++){if(Object.values(bot.entities).some(e=>['area_effect_cloud','dragon_fireball'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<20))throw Error('UP current cloud');await closedUp(i<2?'cobblestone':'netherrack');}}catch(e){console.log('RAISE_FAIL',String(e),JSON.stringify({state:state(),damage}));try{await northDown();}catch(f){console.log('DOWN_FAIL',String(f));}bot.removeListener('entityHurt',hurt);throw e;}
global.fireNorth104=true;
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

const REAL=global.fireNorth104===true,base=62,hatch=v(-9,64,-26),hp0=bot.health;
const target=Object.values(bot.entities).find(e=>e.name==='end_crystal'&&e.position.distanceTo(v(-12.5,104,-39.5))<.1);
const ids=new Set(),flight=[],events=[],poses=[];let fired=false,accepted=false,tried=false,handler=null,reason='notstarted';
const spawn=e=>{if(e.name==='snowball'&&e.position.distanceTo(bot.entity.position)<4){ids.add(e.id);flight.push({event:'spawn',at:new Date().toISOString(),p:e.position.clone(),velocity:e.velocity?.clone()});}};
const moved=e=>{if(ids.has(e.id)&&flight.length<35)flight.push({event:'move',at:new Date().toISOString(),p:e.position.clone(),velocity:e.velocity?.clone()});};
const gone=e=>{if(ids.has(e.id)||e.id===target?.id)events.push({event:'gone',at:new Date().toISOString(),id:e.id,n:e.name,p:e.position.clone(),dim:bot.game.dimension,hp:bot.health});};
bot.on('entitySpawn',spawn);bot.on('entityMoved',moved);bot.on('entityGone',gone);
async function escape(){await northDown();}
try{console.log('SHOT_SOURCE',JSON.stringify({real:REAL,state:state(),target:target?[target.id,target.position,target.width,target.height]:null}));if(bot.game.dimension!=='the_end'||!bot.entity.position.floored().equals(v(-9,62,-26))||!bot.entity.onGround||!target||!full(hatch)||count('end_stone')<4||hp0<18||!boundary().every(b=>b.full)||(REAL&&!count('snowball')))throw Error('source');if(Object.values(bot.entities).some(e=>['area_effect_cloud','dragon_fireball'].includes(e.name)&&e.position.distanceTo(bot.entity.position)<20))throw Error('hazard preflight');
const a=78.25*Math.PI/180,d=target.position.minus(bot.entity.position),R=Math.hypot(d.x,d.z),out=v(d.x/R*Math.cos(a),Math.sin(a),d.z/R*Math.cos(a));
await cut(hatch);const nominalVelocity=out.scaled(1.5);nominalVelocity.y+=.42;const predicted=inspectArc(v(bot.entity.position.x,base+1.94,bot.entity.position.z),nominalVelocity,target);console.log('ARC_CURRENT_SHAPES',JSON.stringify(predicted));if(predicted.status!=='nominal_target_intersection')throw Error('nominal arc blocked');
if(REAL)await bot.equip(bot.inventory.items().find(i=>i.name==='snowball'),'hand');await bot.lookAt(bot.entity.position.offset(0,bot.entity.eyeHeight,0).plus(out.scaled(20)),true);await wait(3);
handler=()=>{const p=bot.entity.position.clone();if(poses.length<30)poses.push({at:new Date().toISOString(),p,height:bot.entity.height,eye:bot.entity.eyeHeight,top:p.y+bot.entity.height,hp:bot.health});};
bot.on('physicsTick',handler);bot.setControlState('jump',true);for(let k=0;k<25;k++){await wait(1);const p=bot.entity.position.clone();if(!tried&&p.y>base+.1){tried=true;reason='phase skip';if(p.y>=base+.39&&p.y<=base+.46){const hit=bot.world.raycast(p.offset(0,bot.entity.eyeHeight,0),out,3);if(!hit){accepted=true;reason=REAL?'ordinaryuse':'dryqualified';console.log('FIRST_TICK_AFTER_POSITION',JSON.stringify({p,h:bot.entity.height,eye:bot.entity.eyeHeight,pitch:bot.entity.pitch,yaw:bot.entity.yaw,R,real:REAL}));if(REAL){bot.activateItem();fired=true;}}else reason='outgoingblocked '+hit.name;}bot.setControlState('jump',false);bot.setControlState('sneak',true);}if(tried&&bot.entity.onGround&&Math.abs(bot.entity.position.y-base)<.03&&k>3)break;}

}catch(e){reason=String(e);console.log('SHOT_ABORT',reason,JSON.stringify(state()));}
finally{if(handler)bot.removeListener('physicsTick',handler);stop();try{if(bot.entity.onGround&&bot.entity.position.floored().equals(v(-9,62,-26)))await place(hatch,'end_stone');else throw Error('not original landing');}catch(e){console.log('REPAIR_FAIL',String(e));try{await escape();}catch(f){console.log('ESCAPE_FAIL',String(f));}}
try{await northDown();}catch(e){console.log('POSTSHOT_DOWN_FAIL',String(e));}
if(REAL)for(let k=0;k<90;k++){await wait(1);if(bot.health<hp0&&bot.entity.position.y>55){try{await escape();}catch(e){console.log('HURT_ESCAPE_FAIL',String(e));}break;}}
console.log('SHOT_RESULT',JSON.stringify({real:REAL,reason,accepted,fired,poses,flight,events,targetPresent:target?!!bot.entities[target.id]:null,state:state(),boundary:boundary(),crystals:Object.values(bot.entities).filter(e=>e.name==='end_crystal').map(e=>[e.id,e.position])}));bot.removeListener('entitySpawn',spawn);bot.removeListener('entityMoved',moved);bot.removeListener('entityGone',gone);stop();}

console.log('DAMAGE_TRACE',JSON.stringify(damage));bot.removeListener('entityHurt',hurt);

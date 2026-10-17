function P1pick(){const lim={stone_pickaxe:131,iron_pickaxe:250,diamond_pickaxe:1561},rank={stone_pickaxe:0,iron_pickaxe:1,diamond_pickaxe:2};return bot.inventory.items().filter(i=>lim[i.name]&&i.durabilityUsed<lim[i.name]-2).sort((a,b)=>rank[a.name]-rank[b.name]||b.durabilityUsed-a.durabilityUsed)[0]}
const{Vec3}=require('vec3');const V=a=>new Vec3(...a),key=q=>q.toString(),self=bot.entity,start=Date.now(),hp0=bot.health,wanted=0;let opened=false,cleanup=false,issue=null,cuts=0,moves=0;bot.clearControlStates();bot.pathfinder.setGoal(null);const air=q=>['air','cave_air','torch','wall_torch','cobweb'].includes(bot.blockAt(q)?.name),full=q=>bot.blockAt(q)?.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1'),count=n=>bot.inventory.items().filter(i=>i.name===n).reduce((s,i)=>s+i.count,0),oldcaps=new Set(global.P1HarvestCaps12||[]),newcaps=[];function check(){if(!cleanup&&bot.health<hp0-.1)throw Error('DAMAGE_END');if(bot.entity!==self||bot.game.dimension!=='overworld'||(cleanup?bot.health<=0:bot.health<7)||(Date.now()-start>(cleanup?55000:30000)||Date.now()>1792250255000))throw Error('LIFE_TIME')};async function tick(n){check();await bot.waitForTicks(n);check()};function threat(){const eye=bot.entity.position.offset(0,1.62,0);return Object.values(bot.entities).find(e=>{if(!['zombie','skeleton','stray','creeper','spider','silverfish','enderman','magma_cube','piglin','hoglin','blaze','ghast'].includes(e.name)||e.position.distanceTo(bot.entity.position)>=(['skeleton','stray','blaze','ghast'].includes(e.name)?24:7))return false;const d=e.position.offset(0,1,0).minus(eye);return !bot.world.raycast(eye,d.unit(),Math.max(.01,d.norm()-.3))})}async function clear(q){let b=bot.blockAt(q);if(['air','cave_air','torch','wall_torch'].includes(b?.name))return;if(b?.name==='cobweb'){await bot.equip(bot.inventory.items().find(i=>i.name==='iron_sword')||bot.inventory.items().find(i=>i.name==='stone_sword'),'hand');}else if(oldcaps.has(key(q))||['cobbled_deepslate','netherrack','stone_brick_slab','bookshelf','stone','deepslate','tuff','oak_planks','stone_bricks','mossy_stone_bricks','cracked_stone_bricks','basalt','blackstone'].includes(b?.name)){await bot.equip(P1pick(),'hand')}else throw Error('CLEAR_KIND_'+b?.name);await tick(2);await bot.dig(b,true);await tick(3);if(!['air','cave_air'].includes(bot.blockAt(q)?.name))throw Error('CUT_ACK');cuts++}async function put(q){if(full(q))return;let b=bot.blockAt(q);if(b?.name==='chest'){const c=await bot.openContainer(b);console.log('CHEST_ACTUAL',q,c.containerItems().map(i=>[i.name,i.count]));bot.closeWindow(c);await tick(2);await bot.equip(P1pick(),'hand');await bot.dig(bot.blockAt(q),true);await tick(4);b=bot.blockAt(q)}if(['stone_brick_slab','cobweb','torch','wall_torch','ladder'].includes(b?.name)){if(b.name==='cobweb')await clear(q);else{await bot.equip(P1pick(),'hand');await bot.dig(b,true);await tick(2)}}if(!['air','cave_air'].includes(bot.blockAt(q)?.name))throw Error('PUT_KIND_'+bot.blockAt(q)?.name+'_'+q);let d=[[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]].map(V).find(d=>full(q.plus(d)));if(!d)throw Error('REF');await bot.equip((bot.inventory.items().find(i=>i.name==='basalt')||bot.inventory.items().find(i=>i.name==='cobbled_deepslate')||bot.inventory.items().find(i=>i.name==='netherrack')||bot.inventory.items().find(i=>['stone_bricks','mossy_stone_bricks','cracked_stone_bricks','blackstone','cobblestone','tuff'].includes(i.name))),'hand');bot.setControlState('sneak',true);try{await bot.placeBlock(bot.blockAt(q.plus(d)),d.scaled(-1));await tick(3)}finally{bot.clearControlStates()}if(!full(q))throw Error('CAP_ACK');newcaps.push(key(q))}async function move(q){await clear(q.offset(0,1,0));await clear(q);for(let n=0;n<50;n++){check();if(!cleanup&&threat())throw Error('LOCAL_THREAT');let p=bot.entity.position,d=Math.hypot(p.x-q.x-.5,p.z-q.z-.5);if(d<.09&&bot.entity.onGround){bot.clearControlStates();await tick(2);moves++;return}if(!full(q.offset(0,-1,0)))throw Error('FLOOR');await bot.lookAt(V([q.x+.5,p.y+1.4,q.z+.5]),true);bot.setControlState('sneak',d<.35);bot.setControlState('forward',true);await tick(1)}throw Error('MOVE_BOUND')}
const origin=V([134,-36,2276]),donor=V([131,-36,2276]),receive=V([133,-36,2276]);
const before={rod:count('blaze_rod'),powder:count('blaze_powder'),eye:count('ender_eye')};
let actualReceipt=false,closed=false;
function donorPresent(){const e=bot.players.p2?.entity;return e&&e.position.distanceTo(donor.offset(.5,0,.5))<.25&&Math.abs(e.position.y+36)<.12;}
try{
 if(bot.game.dimension!=='overworld'||!bot.entity.position.floored().equals(origin))throw Error('FRAME_STAGE');
 if(!donorPresent())throw Error('ACTUAL_DONOR_REQUIRED');
 if(bot.health<16||count('cobbled_deepslate')+count('stone_bricks')+count('mossy_stone_bricks')+count('tuff')<8)throw Error('BODY_CAP_RESERVE');
 if(threat())throw Error('LOCAL_THREAT');
 // The combined donor-to-receiver corridor must already have an opaque outer
 // boundary. Only the internal 132/133 body columns are opened by p1.
 const outer=[];for(let x=131;x<=134;x++){
  outer.push(V([x,-37,2276]),V([x,-34,2276]));
  for(let y of[-36,-35])for(let z of[2275,2277])outer.push(V([x,y,z]));
 }
 for(let x of[130,135])for(let y of[-36,-35])outer.push(V([x,y,2276]));
 const bad=outer.filter(q=>!full(q));if(bad.length)throw Error('COMPOUND_BOUNDARY_'+bad.map(q=>q.toString()+':'+bot.blockAt(q)?.name).join('|'));
 if(!air(donor)||!air(donor.offset(0,1,0)))throw Error('DONOR_BODY');
 opened=true;for(let x of[133,132])for(let y of[-35,-36])await clear(V([x,y,2276]));
 await move(receive);
 console.log('ACTUAL_RECEIVER_READY',bot.entity.position);
 bot.chat('P1 actual frame receiver133.5,-36,2276.5 READY; P2 at131.5 faceEast and toss retained rod/powder/Eye toward me now. One bounded15s receipt window; both stay in this enclosed corridor.');
 for(let n=0;n<300;n++){
  if(count('blaze_rod')>before.rod||count('blaze_powder')>before.powder||count('ender_eye')>before.eye){actualReceipt=true;break;}
  await tick(1);
 }
 console.log('ACTUAL_INPUT_RECEIPT',JSON.stringify({actualReceipt,before,after:{rod:count('blaze_rod'),powder:count('blaze_powder'),eye:count('ender_eye')}}));
}catch(e){issue=e.message;console.log('ISSUE',issue)}finally{
 cleanup=true;bot.clearControlStates();
 if(opened&&bot.entity===self&&bot.game.dimension==='overworld'&&bot.health>0)try{
  if(bot.entity.position.floored().equals(receive))await move(origin);
  if(!bot.entity.position.floored().equals(origin))throw Error('UNKNOWN_RECOVERY_BODY');
  for(let y of[-36,-35])await put(V([133,y,2276]));
  closed=[origin.offset(0,-1,0),origin.offset(0,2,0),...[[1,0],[-1,0],[0,1],[0,-1]].flatMap(([x,z])=>[origin.offset(x,0,z),origin.offset(x,1,z)])].every(full);
 }catch(e){console.log('DANGEROUS_ENDING',e.message)}
 global.P1HarvestCaps12=[...oldcaps,...newcaps];bot.clearControlStates();bot.pathfinder.setGoal(null);
}
return{issue,actualReceipt,opened,closed,p:bot.entity.position,hp:bot.health,food:bot.food,rod:count('blaze_rod'),powder:count('blaze_powder'),eye:count('ender_eye'),cursor:bot.inventory.selectedItem,cuts,moves,controls:Object.fromEntries(['forward','back','left','right','jump','sprint','sneak'].map(k=>[k,bot.getControlState(k)]))};

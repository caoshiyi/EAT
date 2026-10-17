bot.clearControlStates();bot.pathfinder.setGoal(null);const{Vec3}=require('vec3');if(bot.game.dimension!=='the_end')return{issue:'WRONG_DIM_NO_ACTION',world:bot.game.dimension,p:bot.entity.position.clone(),hp:bot.health};
const planBridge=function planBridge({origin,direction,block,stock,pickUses,maxSteps=64,reserve=12,toolReserve=20}){
 const add=(a,b,n=1)=>a.map((v,i)=>v+b[i]*n), side=[-direction[2],0,direction[0]], up=[0,1,0], down=[0,-1,0];
 const air=b=>b&&['air','cave_air'].includes(b.name), full=b=>b&&b.full===true, native=q=>{const b=block(q);return b?.name==='end_stone'&&full(b)};
 if(!full(block(add(origin,down))))return{ok:false,why:'SOURCE_FLOOR'};
 let floors=0,cuts=0;const route=[];
 for(let n=1;n<=maxSteps;n++){
  const q=add(origin,direction,n),f=block(add(q,down));
  if(!full(f)){if(!air(f))return{ok:false,why:'UNKNOWN_OR_PARTIAL_FLOOR',q};floors++;}
  for(const y of[0,1]){const t=add(q,up,y),b=block(t);if(air(b))continue;if(native(t))cuts++;else return{ok:false,why:'BODY_KIND',q:t,name:b?.name};}
  route.push(q);
  const goal=native(q)&&native(add(q,up))&&native(add(q,down))&&native(add(q,up,2))&&[1,-1].every(s=>[0,1].every(y=>native(add(add(q,side,s),up,y))))&&[0,1].every(y=>native(add(add(q,direction),up,y)));
  if(goal){if(stock<floors+reserve)return{ok:false,why:'MATERIAL_PRICE',floors,reserve,stock};if(pickUses<cuts+toolReserve)return{ok:false,why:'TOOL_PRICE',cuts,pickUses};return{ok:true,route,goal:q,floors,cuts,reserve,toolReserve,stock,pickUses,ending:'mine native body2, collect EndStone2, seal bridge-side body2; verify native ten faces/HP/controls'};}
 }
 return{ok:false,why:'NO_NATIVE_ENDING',floors,cuts};
};
const p=bot.entity.position.floored(),origin=[p.x,p.y,p.z],direction=Math.abs(p.x)>=Math.abs(p.z)?[-Math.sign(p.x),0,0]:[0,0,-Math.sign(p.z)],block=a=>{const b=bot.blockAt(new Vec3(...a));return b?{name:b.name,full:b.shapes?.some(s=>s.join(',')==='0,0,0,1,1,1')}:null};
if(!bot.entity.onGround||Math.abs(bot.entity.position.y-p.y)>.12||block([p.x,p.y-1,p.z])?.name!=='obsidian')return{issue:'ACTUAL_PLATFORM_PRE',p:bot.entity.position.clone(),hp:bot.health};
const names=['cobbled_deepslate','basalt','mossy_stone_bricks','cracked_stone_bricks','stone_bricks','blackstone','tuff','cobblestone','end_stone'],stock=bot.inventory.items().filter(i=>names.includes(i.name)).reduce((s,i)=>s+i.count,0),picks=bot.inventory.items().filter(i=>i.name==='stone_pickaxe'),pickUses=picks.length?131-Math.min(...picks.map(i=>i.durabilityUsed)):0,result=planBridge({origin,direction,block,stock,pickUses});if(result.ok)global.P4EndBridgePlan={...result,origin,direction,entityId:bot.entity.id,at:Date.now()};else delete global.P4EndBridgePlan;return{issue:result.ok?null:result.why,result,p:bot.entity.position.clone(),hp:bot.health,food:bot.food,world:bot.game.dimension,creatures:Object.values(bot.entities).filter(e=>['ender_dragon','enderman','area_effect_cloud','dragon_fireball'].includes(e.name)).map(e=>({id:e.id,name:e.name,p:e.position.clone(),hp:e.metadata?.[9]}))};

// Pure first-entry route planner. block() reads the caller's actual loaded world.
module.exports=function planBridge({origin,direction,block,stock,pickUses,maxSteps=64,reserve=12,toolReserve=20}){
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
